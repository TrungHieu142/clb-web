import { api } from './api.js';
import { clear, showError } from './ui.js';

const form = document.querySelector('#login-form');
const msg = document.querySelector('#msg');
const btn = document.querySelector('#submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clear(msg);

  btn.disabled = true;
  btn.textContent = 'Đang xác thực...';

  try {
    const data = await api('POST', '/api/auth/login', {
      email: form.email.value.trim(),
      password: form.password.value
    });

    // Lưu token và thông tin người dùng vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Đăng nhập thành công -> về trang chủ
    location.href = '/';
  } catch (err) {
    showError(msg, err.message);
    btn.disabled = false;
    btn.textContent = 'Đăng nhập';
  }
});
