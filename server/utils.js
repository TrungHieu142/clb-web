/**
 * Các hàm tiện ích dùng chung cho hệ thống clb-web (ESM)
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function calculateRemainingCapacity(totalCapacity, registeredCount) {
  const total = Number(totalCapacity) || 0;
  const registered = Number(registeredCount) || 0;
  const remaining = total - registered;
  return remaining > 0 ? remaining : 0;
}
