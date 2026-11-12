import { pool } from '../db.js';
import { HttpError, sendJson } from '../http-utils.js';

export async function register(req, res, { params, user }) {
  const activityId = Number(params[0]);
  const userId = user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[act]] = await conn.query(
      'SELECT id, capacity FROM activities WHERE id = ? FOR UPDATE',
      [activityId]
    );
    if (!act) throw new HttpError(404, 'Không tìm thấy hoạt động');

    const [[{ n }]] = await conn.query(
      'SELECT COUNT(*) AS n FROM registrations WHERE activity_id = ?',
      [activityId]
    );
    if (n >= act.capacity) throw new HttpError(409, 'Hoạt động đã hết chỗ');

    try {
      await conn.query(
        'INSERT INTO registrations (activity_id, user_id) VALUES (?, ?)',
        [activityId, userId]
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Bạn đã đăng ký hoạt động này');
      throw e;
    }

    await conn.commit();
    sendJson(res, 201, { registered: n + 1, capacity: act.capacity });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function cancel(req, res, { params, user }) {
  const activityId = Number(params[0]);
  const userId = user.id;

  const [r] = await pool.query(
    'DELETE FROM registrations WHERE activity_id = ? AND user_id = ?',
    [activityId, userId]
  );
  if (r.affectedRows === 0) throw new HttpError(404, 'Bạn chưa đăng ký hoạt động này');
  sendJson(res, 204);
}

export async function listByActivity(req, res, { params }) {
  const activityId = Number(params[0]);
  const [rows] = await pool.query(
    `SELECT r.id, r.created_at, u.id AS user_id, u.full_name, u.email
     FROM registrations r
     JOIN users u ON u.id = r.user_id
     WHERE r.activity_id = ?
     ORDER BY r.created_at DESC`,
    [activityId]
  );
  sendJson(res, 200, rows);
}
