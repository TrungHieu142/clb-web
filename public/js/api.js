export async function api(method, path, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  // Tạm thời tuần 4: giả lập người dùng qua localStorage hoặc mặc định là '2'
  options.headers['X-User-Id'] = localStorage.getItem('userId') ?? '2';

  const res = await fetch(path, options);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Lỗi ${res.status}`);
  return data;
}

