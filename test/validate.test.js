import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateActivity } from '../server/validate.js';

test('validateActivity - Kiểm tra tiêu đề', () => {
  assert.equal(validateActivity({ title: 'ab' }).length > 0, true);
  assert.equal(validateActivity({ title: 'Hoạt động thể thao', capacity: 20, start_at: '2026-11-01 08:00', end_at: '2026-11-01 11:00' }).length, 0);
});

test('validateActivity - Kiểm tra sức chứa', () => {
  assert.equal(validateActivity({ title: 'Hợp lệ', capacity: 0 }).length > 0, true);
  assert.equal(validateActivity({ title: 'Hợp lệ', capacity: -5 }).length > 0, true);
  assert.equal(validateActivity({ title: 'Hợp lệ', capacity: 'abc' }).length > 0, true);
});

test('validateActivity - Kiểm tra thời gian kết thúc phải sau bắt đầu', () => {
  const errs = validateActivity({
    title: 'Hợp lệ',
    capacity: 20,
    start_at: '2026-11-01 10:00:00',
    end_at: '2026-11-01 08:00:00'
  });
  assert.equal(errs.some(e => e.includes('Thời gian kết thúc phải sau')), true);
});

test('validateActivity - Chế độ cập nhật từng phần (partial)', () => {
  // Chỉ sửa title, các trường khác không truyền vẫn hợp lệ
  assert.equal(validateActivity({ title: 'Tên mới' }, { partial: true }).length, 0);
  assert.equal(validateActivity({ title: 'ab' }, { partial: true }).length > 0, true);
});

