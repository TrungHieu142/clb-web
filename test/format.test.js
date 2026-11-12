import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery, seatsLeft, formatDateTime } from '../public/js/format.js';

test('buildQuery - Bỏ qua các giá trị rỗng hoặc null', () => {
  assert.equal(buildQuery({ q: '', page: 2 }), '?page=2');
  assert.equal(buildQuery({ q: null, page: undefined }), '');
  assert.equal(buildQuery({}), '');
});

test('buildQuery - Mã hoá ký tự tiếng Việt và dấu cách', () => {
  assert.equal(buildQuery({ q: 'hiến máu' }), '?q=hi%E1%BA%BFn+m%C3%A1u');
  assert.equal(buildQuery({ q: 'tình nguyện', page: 1 }), '?q=t%C3%ACnh+nguy%E1%BB%87n&page=1');
});

test('seatsLeft - Tính toán đúng số chỗ còn lại', () => {
  assert.equal(seatsLeft(30, 10), 20);
  assert.equal(seatsLeft(50, 0), 50);
});

test('seatsLeft - Không bao giờ trả về số âm khi đăng ký vượt quá', () => {
  assert.equal(seatsLeft(10, 10), 0);
  assert.equal(seatsLeft(10, 15), 0);
  assert.equal(seatsLeft(0, 5), 0);
});

test('formatDateTime - Định dạng ngày giờ tiếng Việt', () => {
  const formatted = formatDateTime('2026-11-20 08:30:00');
  assert.ok(formatted.includes('2026') || formatted.includes('20/11'));
  assert.equal(formatDateTime(''), '');
  assert.equal(formatDateTime(null), '');
});

