const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'realtime_booking'
});

// ❗ Thêm `.promise()` để sử dụng async/await
const db = pool.promise();

module.exports = db;
