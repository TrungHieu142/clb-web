/**
 * Các hàm tiện ích dùng chung cho hệ thống clb-web
 */

// 1. Kiểm tra email có đúng định dạng không
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Kiểm tra có ký tự @ và có dấu chấm tên miền
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// 2. Định dạng ngày giờ chuẩn hiển thị tiếng Việt (DD/MM/YYYY)
function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// 3. Tính số chỗ còn trống của hoạt động
function calculateRemainingCapacity(totalCapacity, registeredCount) {
  const total = Number(totalCapacity) || 0;
  const registered = Number(registeredCount) || 0;
  const remaining = total - registered;
  return remaining > 0 ? remaining : 0;
}

module.exports = {
  isValidEmail,
  formatDate,
  calculateRemainingCapacity
};

