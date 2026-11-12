# Tài liệu API Hệ thống CLB Web (Cập nhật Tuần 5)

Tất cả request và response đều định dạng JSON với mã hoá UTF-8 (ngoại trừ nộp minh chứng gửi multipart/form-data và tải file).

Tất cả API (ngoại trừ Health check và Login) đều yêu cầu Header:
```http
Authorization: Bearer <token_jwt>
```

---

## 1. Xác thực & Tài khoản (Authentication)

### `POST /api/auth/login` (Công khai)
Đăng nhập tài khoản bằng email và mật khẩu (Mật khẩu được đối chiếu bằng `bcryptjs`).
- **Body**:
  ```json
  {
    "email": "admin@clb.test",
    "password": "123456"
  }
  ```
- **Phản hồi 200 OK**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@clb.test",
      "full_name": "Quản trị CLB",
      "role": "ADMIN"
    }
  }
  ```
- **Mã lỗi**: `400` thiếu dữ liệu, `401` email hoặc mật khẩu không đúng.

### `GET /api/auth/me`
Lấy thông tin tài khoản hiện tại từ Token.
- **Phản hồi 200 OK**: Trả về thông tin người dùng (không chứa trường nhạy cảm `password_hash`).

---

## 2. Quản lý Hoạt động (Activities)

- `GET /api/activities`: Lấy danh sách hoạt động có tìm kiếm và phân trang (Yêu cầu đăng nhập).
- `GET /api/activities/:id`: Xem chi tiết hoạt động (kèm thông tin `registered_by_me` và trạng thái minh chứng `evidence_status`).
- `POST /api/activities`: Tạo hoạt động mới (Chỉ `ADMIN`, vi phạm nhận `403 Forbidden`).
- `PATCH /api/activities/:id`: Sửa một phần hoạt động (Chỉ `ADMIN`).
- `DELETE /api/activities/:id`: Xoá hoạt động (Chỉ `ADMIN`).

---

## 3. Đăng ký Hoạt động (Registrations)

- `POST /api/activities/:id/registrations`: Đăng ký tham gia (Dùng transaction `FOR UPDATE` chống hết chỗ và chống trùng 409).
- `DELETE /api/activities/:id/registrations/me`: Huỷ đăng ký của chính mình (Chống IDOR).
- `GET /api/activities/:id/registrations`: Danh sách người đăng ký hoạt động (Chỉ `ADMIN`).

---

## 4. Minh chứng Tham gia (Evidences) - Mới Tuần 5

### `POST /api/activities/:id/evidences`
Thành viên nộp minh chứng cho hoạt động mình đã đăng ký.
- **Content-Type**: `multipart/form-data`
- **Body**: trường `file` (ảnh JPG, PNG hoặc PDF, tối đa 5 MB).
- **Phản hồi 201 Created**:
  ```json
  {
    "id": 1,
    "status": "PENDING",
    "message": "Nộp minh chứng thành công, đang chờ quản trị viên duyệt"
  }
  ```
- **Mã lỗi**: `403` chưa đăng ký hoạt động này, `400` file sai định dạng hoặc > 5 MB.

### `GET /api/evidences?status=PENDING`
Quản trị viên xem danh sách minh chứng cần duyệt.
- **Quyền**: Chỉ `ADMIN` (`MEMBER` nhận `403 Forbidden`).
- **Phản hồi 200 OK**: Danh sách minh chứng gồm tên người nộp, email, tên hoạt động, ngày nộp.

### `PATCH /api/evidences/:id`
Quản trị viên duyệt hoặc từ chối minh chứng.
- **Quyền**: Chỉ `ADMIN`.
- **Body**: `{ "status": "APPROVED" | "REJECTED" }`.
- **Phản hồi 200 OK**: Cập nhật `reviewed_by` và `reviewed_at`.

### `GET /api/evidences/:id/file`
Tải xem file minh chứng an toàn.
- **Quyền**: Chỉ Quản trị viên (`ADMIN`) hoặc chính Thành viên nộp file đó. Người khác truy cập nhận `403 Forbidden` (Chống rò rỉ dữ liệu IDOR).
