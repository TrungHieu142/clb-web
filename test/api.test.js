import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server/app.js';
import { pool } from '../server/db.js';

let server, base, adminToken, memberToken;

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
});

after(async () => {
  server.close();
  await pool.end();
});

test('GET /api/health trả ok (Public)', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('GET /api/activities lấy danh sách hoạt động khi đã đăng nhập', async () => {
  const res = await fetch(`${base}/api/activities?limit=3`, {
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.items));
  assert.equal(data.items.length, 3);
  assert.ok(data.total >= 3);
});

test('GET /api/activities/:id chi tiết hoạt động', async () => {
  const res = await fetch(`${base}/api/activities/1`, {
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.id, 1);
});

test('GET /api/activities/9999 trả 404 khi không tồn tại', async () => {
  const res = await fetch(`${base}/api/activities/9999`, {
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(res.status, 404);
});

test('POST /api/activities dữ liệu sai trả 400', async () => {
  const res = await fetch(`${base}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ title: 'a', capacity: 'abc' }),
  });
  assert.equal(res.status, 400);
});

test('POST /api/activities Quản trị viên tạo hoạt động thành công', async () => {
  const res = await fetch(`${base}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Hội thảo Lập trình Node.js & Bảo mật',
      description: 'Chia sẻ kiến thức bảo mật',
      location: 'Phòng Lab 1',
      start_at: '2026-11-10 09:00:00',
      end_at: '2026-11-10 11:30:00',
      capacity: 50
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.id);
});

test('PATCH /api/activities/:id Quản trị viên cập nhật một phần', async () => {
  const res = await fetch(`${base}/api/activities/1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ title: 'Hoạt động số 1 đã cập nhật tên mới' }),
  });
  assert.equal(res.status, 200);
});

test('POST & DELETE đăng ký và huỷ đăng ký hoạt động với Token', async () => {
  // 1. Đăng ký thành công bằng Token của Member
  const resReg = await fetch(`${base}/api/activities/2/registrations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(resReg.status, 201);

  // 2. Đăng ký lại cùng user -> bị chặn trùng 409
  const resDup = await fetch(`${base}/api/activities/2/registrations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(resDup.status, 409);

  // 3. Huỷ đăng ký thành công -> 204
  const resCancel = await fetch(`${base}/api/activities/2/registrations/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${memberToken}` }
  });
  assert.equal(resCancel.status, 204);
});

test('GET /api/xyz trả 404 cho route không tồn tại', async () => {
  const res = await fetch(`${base}/api/xyz`);
  assert.equal(res.status, 404);
});
