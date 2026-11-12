export async function api(method, path, body) {
  const options = { method, headers: {} };

  // Hỗ trợ cả JSON và FormData (cho upload file minh chứng)
  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body; // Trình duyệt tự thiết lập boundary và Content-Type
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  // Gắn Token JWT thật sự cho mọi request
  const token = localStorage.getItem('token');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, options);

  // Nếu chưa đăng nhập hoặc token hết hạn (401), tự động dọn dẹp và chuyển về trang đăng nhập
  if (res.status === 401 && !location.pathname.endsWith('/login.html')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/login.html';
    return;
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Lỗi ${res.status}`);
  }
  return data;
}
