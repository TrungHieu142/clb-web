import { HttpError, sendJson } from './http-utils.js';
import * as activities from './routes/activities.js';
import * as registrations from './routes/registrations.js';

const routes = [
  {
    method: 'GET',
    pattern: /^\/api\/health$/,
    handler: async (req, res) => {
      sendJson(res, 200, { status: 'ok' });
    }
  },
  { method: 'GET', pattern: /^\/api\/activities$/, handler: activities.list },
  { method: 'GET', pattern: /^\/api\/activities\/(\d+)$/, handler: activities.get },
  { method: 'POST', pattern: /^\/api\/activities$/, handler: activities.create },
  { method: 'PATCH', pattern: /^\/api\/activities\/(\d+)$/, handler: activities.update },
  { method: 'DELETE', pattern: /^\/api\/activities\/(\d+)$/, handler: activities.remove },
  { method: 'POST', pattern: /^\/api\/activities\/(\d+)\/registrations$/, handler: registrations.register },
  { method: 'DELETE', pattern: /^\/api\/activities\/(\d+)\/registrations\/me$/, handler: registrations.cancel },
  { method: 'GET', pattern: /^\/api\/activities\/(\d+)\/registrations$/, handler: registrations.listByActivity },
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

