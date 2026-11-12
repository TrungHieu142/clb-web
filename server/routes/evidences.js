import formidable from 'formidable';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { pool } from '../db.js';
import { HttpError, sendJson, readJson } from '../http-utils.js';

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf'
};
const UPLOAD_DIR = path.resolve('uploads');

// Kiểm tra 4 byte đầu để xác thực định dạng file thật sự (magic bytes)
async function sniff(filepath) {
  let fh;
  try {
    fh = await fs.open(filepath, 'r');
    const buf = Buffer.alloc(4);
    await fh.read(buf, 0, 4, 0);
    if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
    if (buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') return 'image/png';
    if (buf.toString('latin1') === '%PDF') return 'application/pdf';
    return null;
  } catch {
    return null;
  } finally {
    if (fh) await fh.close();
  }
}

// 1. Thành viên nộp minh chứng cho hoạt động
export async function submit(req, res, { params, user }) {
  const activityId = Number(params[0]);
  const userId = user.id;

  // Kiểm tra đăng ký thuộc về người dùng này (chống IDOR)
  const [[reg]] = await pool.query(
    'SELECT id FROM registrations WHERE activity_id = ? AND user_id = ?',
    [activityId, userId]
  );
  if (!reg) {
    throw new HttpError(403, 'Bạn chưa đăng ký hoạt động này nên không thể nộp minh chứng');
  }

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    filter: ({ mimetype }) => Boolean(mimetype && ALLOWED[mimetype])
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    throw new HttpError(400, 'File không hợp lệ hoặc dung lượng vượt quá 5 MB');
  }

  const f = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!f) {
    throw new HttpError(400, 'Chỉ chấp nhận file ảnh JPG, PNG hoặc PDF tối đa 5 MB');
  }

  // Kiểm tra chữ ký file (magic bytes) chống file giả mạo đuôi
  const detectedType = await sniff(f.filepath);
  if (!detectedType || !ALLOWED[detectedType]) {
    await fs.unlink(f.filepath).catch(() => {});
    throw new HttpError(400, 'Nội dung file không đúng định dạng ảnh hoặc PDF hợp lệ');
  }

  // Đổi tên file ngẫu nhiên an toàn (UUID)
  const safeName = crypto.randomUUID() + ALLOWED[detectedType];
  const targetPath = path.join(UPLOAD_DIR, safeName);
  await fs.rename(f.filepath, targetPath);

  // Lưu bản ghi vào bảng evidences
  const [result] = await pool.query(
    'INSERT INTO evidences (registration_id, file_path, status) VALUES (?, ?, ?)',
    [reg.id, safeName, 'PENDING']
  );

  sendJson(res, 201, {
    id: result.insertId,
    status: 'PENDING',
    message: 'Nộp minh chứng thành công, đang chờ quản trị viên duyệt'
  });
}

// 2. Quản trị viên xem danh sách minh chứng (mặc định xem PENDING)
export async function list(req, res, { url }) {
  const status = url.searchParams.get('status') || 'PENDING';
  const [rows] = await pool.query(
    `SELECT e.id, e.file_path, e.status, e.created_at, e.reviewed_at,
            u.id AS user_id, u.full_name, u.email,
            a.id AS activity_id, a.title AS activity_title
     FROM evidences e
     JOIN registrations r ON r.id = e.registration_id
     JOIN users u ON u.id = r.user_id
     JOIN activities a ON a.id = r.activity_id
     WHERE e.status = ?
     ORDER BY e.created_at DESC`,
    [status]
  );
  sendJson(res, 200, rows);
}

// 3. Quản trị viên Duyệt / Từ chối minh chứng
export async function review(req, res, { params, user }) {
  const evidenceId = Number(params[0]);
  const body = await readJson(req);

  if (!['APPROVED', 'REJECTED'].includes(body.status)) {
    throw new HttpError(400, 'Trạng thái duyệt phải là APPROVED hoặc REJECTED');
  }

  const [r] = await pool.query(
    `UPDATE evidences 
     SET status = ?, reviewed_by = ?, reviewed_at = NOW() 
     WHERE id = ?`,
    [body.status, user.id, evidenceId]
  );

  if (r.affectedRows === 0) {
    throw new HttpError(404, 'Không tìm thấy minh chứng để duyệt');
  }

  sendJson(res, 200, { message: 'Đã cập nhật trạng thái minh chứng', status: body.status });
}

// 4. Tải xem file minh chứng an toàn (Chỉ người nộp hoặc ADMIN mới được xem)
export async function download(req, res, { params, user }) {
  const evidenceId = Number(params[0]);

  const [rows] = await pool.query(
    `SELECT e.file_path, r.user_id 
     FROM evidences e
     JOIN registrations r ON r.id = e.registration_id
     WHERE e.id = ?`,
    [evidenceId]
  );

  if (rows.length === 0) {
    throw new HttpError(404, 'Không tìm thấy file minh chứng');
  }

  const ev = rows[0];

  // Kiểm tra quyền: phải là Quản trị hoặc chính người đã nộp file
  if (user.role !== 'ADMIN' && ev.user_id !== user.id) {
    throw new HttpError(403, 'Bạn không có quyền xem minh chứng của người khác');
  }

  const filePath = path.join(UPLOAD_DIR, ev.file_path);
  try {
    await fs.access(filePath);
  } catch {
    throw new HttpError(404, 'File không còn tồn tại trên máy chủ');
  }

  const ext = path.extname(ev.file_path).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
  };

  res.writeHead(200, {
    'Content-Type': mimeMap[ext] || 'application/octet-stream',
    'Content-Disposition': `inline; filename="evidence${ext}"`
  });
  createReadStream(filePath).pipe(res);
}

