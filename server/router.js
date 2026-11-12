import { HttpError, sendJson } from './http-utils.js';
import { requireAuth } from './auth.js';
import * as auth from './routes/auth.js';
import * as activities from './routes/activities.js';
import * as registrations from './routes/registrations.js';
import * as evidences from './routes/evidences.js';

const routes = [
  // 1. Công khai (Public)
  { method: 'GET', pattern: /^\/api\/health$/, handler: async (req, res) => sendJson(res, 200, { status: 'ok' }) },
  { method: 'POST', pattern: /^\/api\/auth\/login$/, handler: auth.login },

  // 2. Yêu cầu Đăng nhập (MEMBER hoặc ADMIN)
  { method: 'GET', pattern: /^\/api\/auth\/me$/, handler: requireAuth([], auth.me) },
  { method: 'GET', pattern: /^\/api\/activities$/, handler: requireAuth([], activities.list) },
  { method: 'GET', pattern: /^\/api\/activities\/(\d+)$/, handler: requireAuth([], activities.get) },
  { method: 'POST', pattern: /^\/api\/activities\/(\d+)\/registrations$/, handler: requireAuth([], registrations.register) },
  { method: 'DELETE', pattern: /^\/api\/activities\/(\d+)\/registrations\/me$/, handler: requireAuth([], registrations.cancel) },
  { method: 'POST', pattern: /^\/api\/activities\/(\d+)\/evidences$/, handler: requireAuth([], evidences.submit) },
  { method: 'GET', pattern: /^\/api\/evidences\/(\d+)\/file$/, handler: requireAuth([], evidences.download) },

  // 3. Chỉ Quản trị viên (ADMIN)
  { method: 'POST', pattern: /^\/api\/activities$/, handler: requireAuth(['ADMIN'], activities.create) },
  { method: 'PATCH', pattern: /^\/api\/activities\/(\d+)$/, handler: requireAuth(['ADMIN'], activities.update) },
  { method: 'DELETE', pattern: /^\/api\/activities\/(\d+)$/, handler: requireAuth(['ADMIN'], activities.remove) },
  { method: 'GET', pattern: /^\/api\/activities\/(\d+)\/registrations$/, handler: requireAuth(['ADMIN'], registrations.listByActivity) },
  { method: 'GET', pattern: /^\/api\/evidences$/, handler: requireAuth(['ADMIN'], evidences.list) },
  { method: 'PATCH', pattern: /^\/api\/evidences\/(\d+)$/, handler: requireAuth(['ADMIN'], evidences.review) },
];

export async function handleApi(req, res, url) {
  try {
    for (const r of routes) {
      const m = url.pathname.match(r.pattern);
      if (m && req.method === r.method) {
        return await r.handler(req, res, { url, params: m.slice(1) });
      }
    }
    sendJson(res, 404, { error: 'Không tìm thấy API' });
  } catch (err) {
    if (err instanceof HttpError) {
      return sendJson(res, err.status, { error: err.message });
    }
    console.error(err);
    sendJson(res, 500, { error: 'Lỗi hệ thống, vui lòng thử lại sau' });
  }
}
