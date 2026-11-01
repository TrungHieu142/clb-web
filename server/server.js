const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình kết nối cơ sở dữ liệu từ file .env
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'clb_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API kiểm tra tình trạng Server và Cơ sở dữ liệu
app.get('/api/health', async (req, res) => {
  let dbStatus = 'ok';
  let dbMessage = 'Ket noi Co so du lieu thanh cong!';

  try {
    // Thử truy vấn 1 câu lệnh đơn giản vào Database để kiểm tra mật khẩu & kết nối
    await pool.query('SELECT 1');
  } catch (error) {
    dbStatus = 'error';
    dbMessage = `Loi ket noi CSDL: ${error.message}`;
  }

  res.json({
    status: dbStatus === 'ok' ? 'ok' : 'partial_error',
    server: 'ok',
    database: {
      status: dbStatus,
      message: dbMessage
    },
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server dang chay tai: http://localhost:${PORT}`);
});
