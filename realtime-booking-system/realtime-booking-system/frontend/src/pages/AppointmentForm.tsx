import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Clock, FileText, Calendar, Stethoscope } from 'lucide-react';

interface Doctor {
  id: number;
  full_name: string;
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

const AppointmentForm: React.FC = React.memo(() => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tính toán thời gian hợp lệ (trước 1 tiếng)
  const getValidDateTime = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // +1 tiếng
    
    return {
      minDate: now.toISOString().split('T')[0], // Ngày hôm nay
      minTime: oneHourLater.toTimeString().slice(0, 5), // Giờ sau 1 tiếng
      currentTime: now.toTimeString().slice(0, 5), // Giờ hiện tại
      currentDate: now.toISOString().split('T')[0] // Ngày hiện tại
    };
  };

  const { minDate, minTime, currentTime, currentDate } = getValidDateTime();
  // Tính toán min time dựa trên ngày được chọn
  const getMinTimeForDate = (selectedDate: string) => {
    if (selectedDate === currentDate) {
      return minTime; // Nếu chọn hôm nay thì phải sau 1 tiếng
    }
    return undefined; // Nếu chọn ngày khác thì không giới hạn giờ
  };

  // Tạo danh sách giờ theo định dạng Việt Nam (12 giờ)
  const generateTimeOptions = () => {
    const options = [];
    const minTimeObj = getMinTimeForDate(date);
    
    for (let hour = 6; hour <= 20; hour++) { // Từ 6h sáng đến 8h tối
      for (let minute = 0; minute < 60; minute += 15) { // Mỗi 15 phút
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Kiểm tra nếu thời gian hợp lệ
        if (minTimeObj && time24 <= minTimeObj) {
          continue; // Bỏ qua thời gian đã qua
        }
        
        // Chuyển đổi sang định dạng 12 giờ
        let displayHour = hour;
        let period = 'SA';
        
        if (hour > 12) {
          displayHour = hour - 12;
          period = 'CH';
        } else if (hour === 12) {
          period = 'CH';
        }
        
        const time12 = `${displayHour.toString().padStart(2, '0')} : ${minute.toString().padStart(2, '0')} ${period}`;
        
        options.push(
          <option key={time24} value={time24}>
            {time12}
          </option>
        );
      }
    }
    
    return options;
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axios.get('/api/specialties');
        setSpecialties(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách khoa:', err);
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = '/api/doctors';
        
        // Nếu có chọn khoa, lấy bác sĩ theo khoa
        if (selectedSpecialty) {
          url = `/api/specialties/${selectedSpecialty}/doctors`;
        }
        
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Doctors:', res.data);
        setDoctors(res.data);
        setDoctorId(''); // Reset doctor khi đổi khoa
      } catch (err) {
        console.error('Lỗi khi tải danh sách bác sĩ:', err);
        setMessage('Không thể tải danh sách bác sĩ');
      }
    };

    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Kiểm tra thời gian hợp lệ
      if (!time) {
        toast.error('❌ Vui lòng chọn giờ khám!');
        setIsLoading(false);
        return;
      }

      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      if (selectedDateTime <= oneHourLater) {
        toast.error('❌ Chỉ có thể đặt lịch trước 1 tiếng!');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const appointmentTime = `${date}T${time}`;

      await axios.post('/api/appointments', {
        doctor_id: doctorId,
        appointment_time: appointmentTime,
        note
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('✅ Đặt lịch thành công!');
      
      // Reset form
      setDoctorId('');
      setDate('');
      setTime('');
      setNote('');
      
    } catch (error) {
      console.error('Lỗi đặt lịch:', error);
      toast.error('❌ Đặt lịch thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {message && (
        <div key="message" style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="form-group">
          <label htmlFor="specialty" className="form-label">
            <Stethoscope size={16} />
            Chọn khoa khám
          </label>
          <select
            id="specialty"
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="">-- Chọn khoa khám --</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="doctorId" className="form-label">
            <User size={16} />
            Chọn bác sĩ
          </label>
          <select
            id="doctorId"
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            required
            className="form-select"
            disabled={isLoading || !selectedSpecialty}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
          {!selectedSpecialty && (
            <small style={{ color: '#666', fontSize: '12px' }}>
              Vui lòng chọn khoa khám trước
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Calendar size={16} />
            Chọn thời gian
          </label>
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #2196f3',
            color: '#1976d2',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} />
            <span>💡 <strong>Lưu ý:</strong> Chỉ có thể đặt lịch trước 1 tiếng. Giờ khám từ 06:00 SA đến 08:00 CH</span>
          </div>
          <div className="time-grid">
            <div className="time-input-group">
              <label htmlFor="appointmentDate">
                Ngày khám
              </label>
              <input
                id="appointmentDate"
                type="date"
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                  // Reset time khi đổi ngày để tránh conflict
                  if (e.target.value !== date) {
                    setTime('');
                  }
                }}
                min={minDate}
                required
                className="form-input"
                disabled={isLoading}
              />
            </div>
            <div className="time-input-group">
              <label htmlFor="appointmentTime">
                Giờ khám
              </label>
              <select
                id="appointmentTime"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                className="form-input"
                disabled={isLoading}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="">-- Chọn giờ khám --</option>
                {generateTimeOptions()}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="note" className="form-label">
            <FileText size={16} />
            Ghi chú (tùy chọn)
          </label>
          <textarea
            id="note"
            placeholder="Nhập ghi chú nếu có..."
            value={note}
            onChange={e => setNote(e.target.value)}
            className="form-textarea"
            disabled={isLoading}
            rows={4}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-btn"
          style={{
            width: '100%',
            marginTop: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Calendar size={18} />
                <span>Đặt lịch khám</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
});

AppointmentForm.displayName = 'AppointmentForm';

export default AppointmentForm;
