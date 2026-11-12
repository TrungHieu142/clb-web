import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { HttpError, readJson, sendJson } from '../http-utils.js';

export async function login(req, res) {
  const { email, password } = await readJson(req);
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Thiếu email hoặc mật khẩu');
  }

  const [rows] = await pool.query(
    'SELECT id, email, full_name, role, password_hash FROM users WHERE email = ?',
    [email.trim()]
  );
  const user = rows[0];

  // Cùng một thông báo cho cả hai trường hợp để không lộ email có tồn tại hay không
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Email hoặc mật khẩu không đúng');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  sendJson(res, 200, {
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
  });
}

export async function me(req, res, ctx) {
  const [rows] = await pool.query(
    'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
    [ctx.user.id]
  );
  if (rows.length === 0) throw new HttpError(404, 'Không tìm thấy người dùng');
  sendJson(res, 200, rows[0]);
}

