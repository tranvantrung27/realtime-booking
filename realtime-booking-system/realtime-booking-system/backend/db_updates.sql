-- Tạo bảng lưu trữ token thiết bị cho thông báo đẩy
CREATE TABLE IF NOT EXISTS device_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  device_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, token)
);

-- Thêm cột created_at vào bảng appointments nếu chưa có
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Thêm cột updated_at vào bảng appointments nếu chưa có
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Thêm cột cho lịch sử khám bệnh
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS prescription TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS follow_up_date DATE;

-- Tạo bảng cho lịch sử khám bệnh chi tiết (nếu muốn tách riêng)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_time ON appointments(appointment_time);