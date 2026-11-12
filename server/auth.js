import jwt from 'jsonwebtoken';
import { HttpError } from './http-utils.js';

export function requireAuth(roles, handler) {
  return async (req, res, ctx) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Bạn chưa đăng nhập');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    if (roles.length > 0 && !roles.includes(payload.role)) {
      throw new HttpError(403, 'Bạn không có quyền thực hiện thao tác này');
    }

    ctx.user = { id: payload.sub, role: payload.role };
    return handler(req, res, ctx);
  };
}

