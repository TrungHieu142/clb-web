// Quản lý điều hướng và phiên làm việc người dùng (Tuần 5)

export function setupNav() {
  const isLoginPage = location.pathname.endsWith('/login.html');
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    if (!isLoginPage) {
      location.href = '/login.html';
    }
    return;
  }

  // Nếu đã đăng nhập mà lại mở /login.html -> tự chuyển về trang chủ
  if (isLoginPage) {
    location.href = '/';
    return;
  }

  let user = {};
  try {
    user = JSON.parse(userJson);
  } catch {
    localStorage.clear();
    location.href = '/login.html';
    return;
  }

  const header = document.querySelector('.site-header');
  if (!header) return;

  // 1. Kiểm soát hiển thị các nút Quản trị theo vai trò (Chỉ ADMIN mới thấy)
  const navAdmin = document.querySelector('#nav-admin');
  const navEvidences = document.querySelector('#nav-evidences');

  if (user.role !== 'ADMIN') {
    if (navAdmin) navAdmin.style.display = 'none';
    if (navEvidences) navEvidences.style.display = 'none';
  } else {
    if (navAdmin) navAdmin.style.display = 'inline-block';
    if (navEvidences) navEvidences.style.display = 'inline-block';
  }

  // 2. Thay nút "Đăng nhập" bằng Tên người dùng và nút "Đăng xuất"
  const existingUserInfo = document.querySelector('#user-nav-box');
  if (existingUserInfo) existingUserInfo.remove();

  const userBox = document.createElement('div');
  userBox.id = 'user-nav-box';
  userBox.style.cssText = 'margin-left: auto; display: flex; align-items: center; gap: 0.8rem; font-size: 0.9rem;';

  const userTag = document.createElement('span');
  userTag.textContent = `👤 ${user.full_name} (${user.role === 'ADMIN' ? 'Quản trị' : 'Thành viên'})`;
  userTag.style.fontWeight = '500';

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn--secondary';
  logoutBtn.style.cssText = 'padding: 0.3rem 0.6rem; font-size: 0.85rem;';
  logoutBtn.textContent = 'Đăng xuất';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/login.html';
  });

  userBox.append(userTag, logoutBtn);
  header.append(userBox);
}

// Tự động chạy khi nạp module
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNav);
} else {
  setupNav();
}

