# Tài liệu API Hệ thống CLB Web (Tuần 3)

Tất cả request và response đều định dạng JSON với mã hoá UTF-8.

---

## 1. Kiểm tra hệ thống (Health Check)

### `GET /api/health`
Kiểm tra trạng thái hoạt động của server.
- **Header**: Không yêu cầu
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

---

## 2. Quản lý Hoạt động (Activities)

### `GET /api/activities`
Lấy danh sách hoạt động có tìm kiếm theo tên và phân trang.
- **Query params**:
  - `q`: Từ khoá tìm kiếm theo tên hoạt động (mặc định: `""`)
  - `page`: Trang hiện tại (mặc định: `1`)
  - `limit`: Số lượng bản ghi mỗi trang (mặc định: `10`, tối đa `50`)
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "title": "Hoạt động số 1",
        "description": "Mô tả mẫu",
        "location": "Hội trường A",
        "start_at": "2026-11-02 08:00:00",
        "end_at": "2026-11-02 11:00:00",
        "capacity": 21,
        "registered": 0
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10
  }
  ```

---

### `GET /api/activities/:id`
Lấy thông tin chi tiết một hoạt động theo mã ID.
- **Tham số URL**: `id` (mã hoạt động)
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "id": 1,
    "title": "Hoạt động số 1",
    "description": "Mô tả mẫu",
    "location": "Hội trường A",
    "start_at": "2026-11-02 08:00:00",
    "end_at": "2026-11-02 11:00:00",
    "capacity": 21,
    "created_by": 1,
    "created_at": "2026-11-01 13:30:00",
    "registered": 0
  }
  ```
- **Mã lỗi**:
  - `404 Not Found`: `{ "error": "Không tìm thấy hoạt động" }`

---

### `POST /api/activities`
Tạo mới một hoạt động (Dành cho Quản trị viên).
- **Header**:
  - `Content-Type: application/json`
  - `X-User-Id: <id-quan-tri>`
- **Body mẫu**:
  ```json
  {
    "title": "Hội thảo Lập trình Web với Node.js",
    "description": "Hướng dẫn thực chiến cho thành viên CLB",
    "location": "Phòng Hội thảo B",
    "start_at": "2026-11-15 08:00:00",
    "end_at": "2026-11-15 11:30:00",
    "capacity": 50
  }
  ```
- **Phản hồi thành công (201 Created)**:
  ```json
  {
    "id": 13
  }
  ```
- **Mã lỗi**:
  - `400 Bad Request`: Dữ liệu không hợp lệ (tên quá ngắn, sức chứa sai, ngày kết thúc trước ngày bắt đầu).

---

### `PATCH /api/activities/:id`
Cập nhật một hoặc nhiều thông tin của hoạt động.
- **Header**: `Content-Type: application/json`
- **Body mẫu**:
  ```json
  {
    "title": "Tên hoạt động đã sửa",
    "capacity": 60
  }
  ```
- **Phản hồi thành công (200 OK)**:
  ```json
  {
    "message": "Cập nhật thành công"
  }
  ```
- **Mã lỗi**:
  - `400 Bad Request`: Không có trường hợp lệ hoặc dữ liệu sai.
  - `404 Not Found`: Không tìm thấy hoạt động để sửa.

---

### `DELETE /api/activities/:id`
Xoá một hoạt động (các đăng ký liên quan sẽ tự động bị xoá theo CASCADE).
- **Phản hồi thành công (204 No Content)**: Trả về thân rỗng.
- **Mã lỗi**:
  - `404 Not Found`: `{ "error": "Không tìm thấy hoạt động để xoá" }`

---

## 3. Đăng ký tham gia (Registrations)

### `POST /api/activities/:id/registrations`
Đăng ký tham gia hoạt động (Xử lý an toàn đồng thời bằng Transaction và khóa dòng `FOR UPDATE`).
- **Header**: `X-User-Id: <id-thanh-vien>`
- **Phản hồi thành công (201 Created)**:
  ```json
  {
    "registered": 5,
    "capacity": 20
  }
  ```
- **Mã lỗi**:
  - `401 Unauthorized`: Thiếu header `X-User-Id`.
  - `404 Not Found`: Không tìm thấy hoạt động.
  - `409 Conflict`: Hoạt động đã hết chỗ HOẶC người dùng đã đăng ký trước đó.

---

### `DELETE /api/activities/:id/registrations/me`
Huỷ lượt đăng ký của chính người dùng hiện tại.
- **Header**: `X-User-Id: <id-thanh-vien>`
- **Phản hồi thành công (204 No Content)**: Trả về thân rỗng.
- **Mã lỗi**:
  - `401 Unauthorized`: Thiếu header `X-User-Id`.
  - `404 Not Found`: Bạn chưa đăng ký hoạt động này.

---

### `GET /api/activities/:id/registrations`
Xem danh sách những người đã đăng ký hoạt động (Dành cho Quản trị viên).
- **Phản hồi thành công (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 2,
      "full_name": "Thành viên 1",
      "email": "member1@clb.test",
      "created_at": "2026-11-01 14:00:00"
    }
  ]
  ```

