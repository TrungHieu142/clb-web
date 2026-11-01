INSERT INTO users (email, full_name, password_hash, role)
VALUES ('admin@clb.test', 'Quản trị CLB', 'TAM_THOI', 'ADMIN');

INSERT INTO users (email, full_name, password_hash, role)
SELECT CONCAT('member', seq, '@clb.test'), CONCAT('Thành viên ', seq), 'TAM_THOI', 'MEMBER'
FROM seq_1_to_20;

INSERT INTO activities (title, description, location, start_at, end_at, capacity, created_by)
SELECT CONCAT('Hoạt động số ', seq), 'Mô tả mẫu', 'Hội trường A',
       DATE_ADD('2026-11-01 08:00:00', INTERVAL seq DAY),
       DATE_ADD('2026-11-01 11:00:00', INTERVAL seq DAY),
       20 + seq, 1
FROM seq_1_to_12;
