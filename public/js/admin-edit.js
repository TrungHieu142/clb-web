import { api } from './api.js';
import { clear, el, showError } from './ui.js';

const form = document.querySelector('#activity-form');
const heading = document.querySelector('#form-heading');
const msgBox = document.querySelector('#form-msg');
const saveBtn = document.querySelector('#save-btn');

const params = new URLSearchParams(location.search);
const id = params.get('id');
const isEdit = Boolean(id);

if (isEdit) {
  heading.textContent = 'Chỉnh sửa hoạt động';
  loadDetail();
}

async function loadDetail() {
  try {
    const a = await api('GET', `/api/activities/${id}`);
    form.title.value = a.title;
    form.description.value = a.description || '';
    form.location.value = a.location || '';
    if (a.start_at) form.start_at.value = a.start_at.slice(0, 16).replace(' ', 'T');
    if (a.end_at) form.end_at.value = a.end_at.slice(0, 16).replace(' ', 'T');
    form.capacity.value = a.capacity;
  } catch (err) {
    showError(msgBox, `Không thể nạp dữ liệu hoạt động: ${err.message}`);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clear(msgBox);

  const start = form.start_at.value;
  const end = form.end_at.value;

  if (new Date(end) <= new Date(start)) {
    showError(msgBox, 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!');
    return;
  }

  const body = {
    title: form.title.value.trim(),
    description: form.description.value.trim() || null,
    location: form.location.value.trim() || null,
    start_at: start.replace('T', ' ') + ':00',
    end_at: end.replace('T', ' ') + ':00',
    capacity: Number(form.capacity.value)
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Đang lưu...';

  try {
    if (isEdit) {
      await api('PATCH', `/api/activities/${id}`, body);
    } else {
      await api('POST', '/api/activities', body);
    }
    // Thành công chuyển về trang quản trị
    location.href = '/admin.html';
  } catch (err) {
    showError(msgBox, err.message);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Lưu hoạt động';
  }
});

