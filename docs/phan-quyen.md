# Ma trận Phân quyền Hệ thống CLB Web (Tuần 5)

| Chức năng | Endpoint | Chưa đăng nhập | Thành viên (MEMBER) | Quản trị (ADMIN) |
| :--- | :--- | :---: | :---: | :---: |
| **Đăng nhập** | `POST /api/auth/login` |  Được |  Được |  Được |
| **Xem thông tin bản thân** | `GET /api/auth/me` | ❌ Không (401) |  Được |  Được |
| **Xem danh sách hoạt động** | `GET /api/activities` | ❌ Không (401) |  Được |  Được |
| **Xem chi tiết hoạt động** | `GET /api/activities/:id` | ❌ Không (401) |  Được |  Được |
| **Đăng ký hoạt động** | `POST /api/activities/:id/registrations` | ❌ Không (401) |  Được |  Được |
| **Huỷ đăng ký của mình** | `DELETE /api/activities/:id/registrations/me` | ❌ Không (401) |  Được |  Được |
| **Tạo mới hoạt động** | `POST /api/activities` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Chỉnh sửa hoạt động** | `PATCH /api/activities/:id` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Xoá hoạt động** | `DELETE /api/activities/:id` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Xem danh sách người đăng ký** | `GET /api/activities/:id/registrations` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Nộp minh chứng của mình** | `POST /api/activities/:id/evidences` | ❌ Không (401) |  Được |  Được |
| **Danh sách minh chứng chờ duyệt** | `GET /api/evidences?status=PENDING` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Duyệt / Từ chối minh chứng** | `PATCH /api/evidences/:id` | ❌ Không (401) | ❌ Không (403) |  Được |
| **Tải xem file minh chứng** | `GET /api/evidences/:id/file` | ❌ Không (401) |  Được (chỉ file của mình) |  Được (tất cả file) |

> **Quy tắc**: Mỗi ô "Không" có ít nhất 1 test tự động kiểm tra trả về `401 Unauthorized` (nếu chưa đăng nhập/token sai) hoặc `403 Forbidden` (nếu đã đăng nhập nhưng không đủ quyền).

