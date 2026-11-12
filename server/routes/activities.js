import { pool } from '../db.js';
import { HttpError, sendJson, readJson } from '../http-utils.js';
import { validateActivity } from '../validate.js';

export async function list(req, res, { url }) {
  const q = url.searchParams.get('q') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));
  const like = `%${q}%`;

  const [items] = await pool.query(
    `SELECT a.id, a.title, a.description, a.location, a.start_at, a.end_at, a.capacity,
            COUNT(r.id) AS registered
     FROM activities a
     LEFT JOIN registrations r ON r.activity_id = a.id
     WHERE a.title LIKE ?
     GROUP BY a.id
     ORDER BY a.start_at
     LIMIT ? OFFSET ?`,
    [like, limit, (page - 1) * limit]
  );

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM activities WHERE title LIKE ?',
    [like]
  );

  sendJson(res, 200, { items, total, page, limit });
}

export async function get(req, res, { params }) {
  const userId = Number(req.headers['x-user-id']) || 0;
  const [rows] = await pool.query(
    `SELECT a.*, COUNT(r.id) AS registered,
            SUM(CASE WHEN r.user_id = ? THEN 1 ELSE 0 END) > 0 AS registered_by_me
     FROM activities a
     LEFT JOIN registrations r ON r.activity_id = a.id
     WHERE a.id = ?
     GROUP BY a.id`,
    [userId, params[0]]
  );
  if (rows.length === 0) throw new HttpError(404, 'Không tìm thấy hoạt động');
  sendJson(res, 200, rows[0]);
}

export async function create(req, res) {
  const body = await readJson(req);
  const errors = validateActivity(body);
  if (errors.length) throw new HttpError(400, errors.join('; '));

  const userId = Number(req.headers['x-user-id']) || 1;
  const [r] = await pool.query(
    `INSERT INTO activities (title, description, location, start_at, end_at, capacity, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [body.title.trim(), body.description ?? null, body.location ?? null,
     body.start_at, body.end_at, body.capacity, userId]
  );
  sendJson(res, 201, { id: r.insertId });
}

export async function update(req, res, { params }) {
  const id = Number(params[0]);
  const body = await readJson(req);
  const errors = validateActivity(body, { partial: true });
  if (errors.length) throw new HttpError(400, errors.join('; '));

  const FIELDS = ['title', 'description', 'location', 'start_at', 'end_at', 'capacity'];
  const sets = FIELDS.filter((f) => body[f] !== undefined);
  if (sets.length === 0) throw new HttpError(400, 'Không có trường nào để cập nhật');

  const [r] = await pool.query(
    `UPDATE activities SET ${sets.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`,
    [...sets.map((f) => body[f]), id]
  );
  if (r.affectedRows === 0) throw new HttpError(404, 'Không tìm thấy hoạt động để sửa');
  sendJson(res, 200, { message: 'Cập nhật thành công' });
}

export async function remove(req, res, { params }) {
  const id = Number(params[0]);
  const [r] = await pool.query('DELETE FROM activities WHERE id = ?', [id]);
  if (r.affectedRows === 0) throw new HttpError(404, 'Không tìm thấy hoạt động để xoá');
  sendJson(res, 204);
}
