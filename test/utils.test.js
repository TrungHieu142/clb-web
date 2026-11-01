const test = require('node:test');
const assert = require('node:assert');
const { isValidEmail, formatDate, calculateRemainingCapacity } = require('../server/utils');

test('Kiểm tra hàm isValidEmail', async (t) => {
  await t.test('Trả về true khi email hợp lệ', () => {
    assert.strictEqual(isValidEmail('admin@clb.test'), true);
    assert.strictEqual(isValidEmail('sinhvien123@gmail.com'), true);
  });

  await t.test('Trả về false khi email thiếu @ hoặc sai định dạng', () => {
    assert.strictEqual(isValidEmail('email-khong-co-a-cong'), false);
    assert.strictEqual(isValidEmail('admin@.com'), false);
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail(null), false);
  });
});

test('Kiểm tra hàm formatDate', async (t) => {
  await t.test('Định dạng đúng ngày theo chuẩn DD/MM/YYYY', () => {
    assert.strictEqual(formatDate('2026-11-01'), '01/11/2026');
  });

  await t.test('Trả về chuỗi rỗng khi ngày không hợp lệ', () => {
    assert.strictEqual(formatDate('ngay-sai'), '');
    assert.strictEqual(formatDate(null), '');
  });
});

test('Kiểm tra hàm calculateRemainingCapacity', async (t) => {
  await t.test('Tính đúng số chỗ còn lại', () => {
    // Sức chứa 30, đã đăng ký 10 -> còn lại 20
    assert.strictEqual(calculateRemainingCapacity(30, 10), 20);
  });

  await t.test('Trả về 0 khi số người đăng ký đã đầy hoặc vượt quá', () => {
    assert.strictEqual(calculateRemainingCapacity(30, 30), 0);
    assert.strictEqual(calculateRemainingCapacity(30, 35), 0);
  });
});

