# Bảng Kịch bản Kiểm thử Thủ công Hệ thống CLB Web (Tuần 5)

Tổng cộng 20 test case bao phủ toàn bộ 5 tính năng chính (F1 đến F5).

| ID | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Thực tế | Đạt? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Có tài khoản `admin@clb.test` | Nhập email và mật khẩu `123456`, bấm Đăng nhập | Đăng nhập thành công, chuyển về trang chủ, hiện tên Quản trị và nút Đăng xuất | Đúng như mong đợi |  Đạt |
| **TC-02** | Có tài khoản `member1@clb.test` | Nhập đúng email, gõ sai mật khẩu `abcdef`, bấm Đăng nhập | Báo lỗi màu đỏ: "Email hoặc mật khẩu không đúng", không đăng nhập được | Đúng như mong đợi |  Đạt |
| **TC-03** | Chưa đăng nhập | Nhập email nhưng bỏ trống ô mật khẩu, bấm Đăng nhập | Trình duyệt cảnh báo yêu cầu điền đầy đủ trường bắt buộc | Đúng như mong đợi |  Đạt |
| **TC-04** | Chưa đăng nhập (xoá token) | Mở trực tiếp trang `http://localhost:3000/` | Hệ thống tự động chuyển hướng về trang `/login.html` | Đúng như mong đợi |  Đạt |
| **TC-05** | Chưa đăng nhập | Mở trực tiếp trang quản trị `/admin.html` | Hệ thống tự động chuyển hướng về `/login.html` | Đúng như mong đợi |  Đạt |
| **TC-06** | Đăng nhập tài khoản Thành viên | Quan sát thanh điều hướng (Header) | Không nhìn thấy nút "Quản trị" và nút "Duyệt minh chứng" | Đúng như mong đợi |  Đạt |
| **TC-07** | Đăng nhập tài khoản Thành viên | Cố tình gõ trực tiếp URL `/admin.html` | Giao diện không thao tác được và mọi lệnh gọi API đều nhận lỗi 403 Forbidden | Đúng như mong đợi |  Đạt |
| **TC-08** | Đăng nhập Thành viên, sửa localStorage `role: ADMIN` | Tải lại trang `/admin.html` và bấm Xoá hoạt động | Server chặn đứng thao tác và báo lỗi 403 (Token thật sự không phải ADMIN) | Đúng như mong đợi |  Đạt |
| **TC-09** | Đã đăng nhập Thành viên | Vào trang chủ, nhập từ khoá "số 1" vào ô tìm kiếm | Danh sách chỉ hiện các hoạt động có chữ "số 1", URL có `?q=s%E1%BB%91+1` | Đúng như mong đợi |  Đạt |
| **TC-10** | Đã đăng nhập Thành viên | Bấm nút "Chi tiết" ở hoạt động bất kỳ | Chuyển sang `activity.html?id=...`, thấy đầy đủ thông tin, thời gian, số chỗ | Đúng như mong đợi |  Đạt |
| **TC-11** | Hoạt động còn chỗ | Bấm nút "Đăng ký tham gia" | Nút chuyển sang "Huỷ đăng ký", số chỗ giảm 1, hiện khung Nộp minh chứng | Đúng như mong đợi |  Đạt |
| **TC-12** | Đã đăng ký hoạt động | Bấm nút "Huỷ đăng ký tham gia" | Đăng ký được huỷ, số chỗ tăng lại 1, nút chuyển về "Đăng ký tham gia" | Đúng như mong đợi |  Đạt |
| **TC-13** | Đã đăng ký hoạt động | Chọn file ảnh `the-sinh-vien.jpg` (dung lượng 1.5 MB), bấm Gửi minh chứng | Báo nộp thành công, trạng thái minh chứng chuyển thành "⏳ Đang chờ duyệt" | Đúng như mong đợi |  Đạt |
| **TC-14** | Đã đăng ký hoạt động | Chọn file tài liệu `tro-choi.exe` đổi tên thành `.jpg` rồi tải lên | Server phát hiện sai chữ ký byte đầu (magic bytes) và từ chối với mã lỗi 400 | Đúng như mong đợi |  Đạt |
| **TC-15** | Đã đăng ký hoạt động | Chọn file dung lượng > 5 MB (ví dụ video đổi đuôi 7 MB) | Server chặn dung lượng và báo lỗi "vượt quá 5 MB" | Đúng như mong đợi |  Đạt |
| **TC-16** | Đăng nhập Thành viên B | Thử mở đường dẫn xem file minh chứng của Thành viên A | Server chặn với mã lỗi 403: "Bạn không có quyền xem minh chứng người khác" | Đúng như mong đợi |  Đạt |
| **TC-17** | Đăng nhập Quản trị viên | Vào trang `evidences.html`, bấm nút "👁 Xem file" của sinh viên vừa nộp | File ảnh/PDF minh chứng mở ra bình thường trong tab mới | Đúng như mong đợi |  Đạt |
| **TC-18** | Đăng nhập Quản trị viên | Ở trang `evidences.html`, bấm nút "✔ Duyệt" cho minh chứng | Minh chứng được duyệt thành công, biến mất khỏi danh sách PENDING | Đúng như mong đợi |  Đạt |
| **TC-19** | Đăng nhập Quản trị viên | Vào `admin-edit.html`, nhập tên hoạt động mới và thời gian hợp lệ, bấm Lưu | Hoạt động mới được thêm vào danh sách quản trị | Đúng như mong đợi |  Đạt |
| **TC-20** | Đăng nhập Quản trị viên | Vào `admin-edit.html`, để thời gian kết thúc trước thời gian bắt đầu | Báo lỗi "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu", form không gửi | Đúng như mong đợi |  Đạt |

