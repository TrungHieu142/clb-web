import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server/app.js';
import { pool } from '../server/db.js';

let server, base, adminToken, memberToken, member2Token;

async function loginAs(email, password = '123456') {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.token;
}

before(async () => {
  server = createAppServer();
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;

  adminToken = await loginAs('admin@clb.test');
  memberToken = await loginAs('member1@clb.test');
  member2Token = await loginAs('member2@clb.test');
});

after(async () => {
  server.close();
  await pool.end();
});

test('Xác thực: Đăng nhập thành công trả về token và thông tin user', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@clb.test', password: '123456' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.equal(data.user.role, 'ADMIN');
  assert.equal(data.user.password_hash, undefined); // Tuyệt đối không lộ password_hash
});

test('Xác thực: Đăng nhập sai mật khẩu trả về 401', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@clb.test', password: 'sai-mat-khau' })
  });
  assert.equal(res.status, 401);
});

test('Xác thực: Thiếu thông tin email/mật khẩu trả về 400', async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@clb.test' })
  });
  assert.equal(res.status, 400);
});

test('Phân quyền: Chưa đăng nhập (không có token) trả về 401', async () => {
  const res = await fetch(`${base}/api/activities`);
  assert.equal(res.status, 401);
});

test('Phân quyền: Token giả mạo hoặc sai định dạng trả về 401', async () => {
  const res = await fetch(`${base}/api/activities`, {
    headers: { Authorization: 'Bearer token-gia-mao-123' }
  });
  assert.equal(res.status, 401);
});

test('Phân quyền: Thành viên gọi POST /api/activities bị từ chối 403', async () => {
  const res = await fetch(`${base}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
    body: JSON.stringify({ title: 'Hoạt động chui', capacity: 10, start_at: '2026-11-20 08:00:00', end_at: '2026-11-20 10:00:00' })
  });
  assert.equal(res.status, 403);
});

test('Phân quyền: Thành viên gọi PATCH /api/activities/:id bị từ chối 403', async () => {
  const res = await fetch(`${base}/api/activities/1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
    body: JSON.stringify({ title: 'Sửa trộm tên' })
  });
  assert.equal(res.status, 403);
});

test('Phân quyền: Thành viên gọi DELETE /api/activities/:id bị từ chối 403', async () => {
  const res = await fetch(`${base}/api/activities/1`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 403);
});

test('Phân quyền: Thành viên gọi GET /api/activities/:id/registrations bị từ chối 403', async () => {
  const res = await fetch(`${base}/api/activities/1/registrations`, {
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 403);
});

test('Phân quyền: Thành viên gọi GET /api/evidences (danh sách duyệt) bị từ chối 403', async () => {
  const res = await fetch(`${base}/api/evidences`, {
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 403);
});

test('Minh chứng: Nộp minh chứng cho hoạt động chưa đăng ký bị từ chối 403 (Chống IDOR)', async () => {
  // Hoạt động 12 memberToken chưa đăng ký
  const formData = new FormData();
  const fileBlob = new Blob(['%PDF-1.4 test content'], { type: 'application/pdf' });
  formData.append('file', fileBlob, 'test.pdf');

  const res = await fetch(`${base}/api/activities/12/evidences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` },
    body: formData
  });
  assert.equal(res.status, 403);
});

test('Minh chứng: Đăng ký, Nộp minh chứng thành công và Quản trị viên Duyệt', async () => {
  // 1. Member đăng ký hoạt động 3
  const regRes = await fetch(`${base}/api/activities/3/registrations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(regRes.status, 201);

  // 2. Member nộp minh chứng (File PDF hợp lệ)
  const formData = new FormData();
  const fileBlob = new Blob(['%PDF-1.4 Fake PDF file content for test evidence'], { type: 'application/pdf' });
  formData.append('file', fileBlob, 'minh-chung.pdf');

  const evRes = await fetch(`${base}/api/activities/3/evidences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` },
    body: formData
  });
  assert.equal(evRes.status, 201);
  const evData = await evRes.json();
  assert.ok(evData.id);
  assert.equal(evData.status, 'PENDING');

  // 3. Quản trị viên xem danh sách PENDING thấy có bản ghi vừa nộp
  const listRes = await fetch(`${base}/api/evidences?status=PENDING`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.ok(listData.some(item => item.id === evData.id));

  // 4. Thành viên khác (member2) cố tình tải file minh chứng của member1 -> Bị từ chối 403!
  const forbiddenRes = await fetch(`${base}/api/evidences/${evData.id}/file`, {
    headers: { Authorization: `Bearer ${member2Token}` }
  });
  assert.equal(forbiddenRes.status, 403);

  // 5. Quản trị viên duyệt minh chứng (APPROVED)
  const reviewRes = await fetch(`${base}/api/evidences/${evData.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  assert.equal(reviewRes.status, 200);
});

