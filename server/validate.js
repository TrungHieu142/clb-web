export function validateActivity(body, { partial = false } = {}) {
  const errors = [];
  const has = (k) => body[k] !== undefined;

  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.length > 200)
      errors.push('Tên hoạt động từ 3 đến 200 ký tự');
  }
  if (!partial || has('capacity')) {
    if (!Number.isInteger(body.capacity) || body.capacity < 1 || body.capacity > 10000)
      errors.push('Sức chứa phải là số nguyên từ 1 đến 10000');
  }
  if (!partial || has('start_at') || has('end_at')) {
    const s = Date.parse(body.start_at);
    const e = Date.parse(body.end_at);
    if (Number.isNaN(s) || Number.isNaN(e)) errors.push('Thời gian không hợp lệ');
    else if (e <= s) errors.push('Thời gian kết thúc phải sau thời gian bắt đầu');
  }
  return errors;
}

