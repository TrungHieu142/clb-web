const form = document.querySelector('#login');
const err = document.querySelector('#err');
const selectUser = document.querySelector('#userId');

// Khởi tạo giá trị userId từ localStorage nếu có
const savedUserId = localStorage.getItem('userId');
if (savedUserId && selectUser) {
  selectUser.value = savedUserId;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Lưu userId giả lập vào localStorage cho tuần 4
  const chosenId = selectUser.value;
  localStorage.setItem('userId', chosenId);

  err.style.display = 'block';
  err.className = 'msg';
  err.textContent = `Đã lưu danh tính người dùng ID = ${chosenId}. Tính năng xác thực mật khẩu qua JWT sẽ được kích hoạt ở Tuần 5!`;
});

