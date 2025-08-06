import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Stethoscope, User, Mail, Phone, ArrowLeft, Calendar } from 'lucide-react';

interface Doctor {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  appointment_count: number;
  profile_image?: string;
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorSpecialties, setDoctorSpecialties] = useState<{[key: number]: Specialty[]}>({});
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      
      try {
        const res = await axios.get('/api/doctors', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDoctors(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Không thể lấy danh sách bác sĩ:', err);
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Thêm useEffect để lấy khoa của từng bác sĩ
  useEffect(() => {
    const fetchDoctorSpecialties = async () => {
      const token = localStorage.getItem('token');
      const specialtiesMap: {[key: number]: Specialty[]} = {};
      
      for (const doctor of doctors) {
        try {
          // Sử dụng endpoint công khai không yêu cầu quyền admin
          const res = await axios.get(`/api/doctors/${doctor.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Kiểm tra cấu trúc dữ liệu trả về
          if (res.data && res.data.specialties) {
            specialtiesMap[doctor.id] = res.data.specialties;
          } else {
            specialtiesMap[doctor.id] = [];
          }
        } catch (err) {
          console.error(`Lỗi khi lấy khoa của bác sĩ ${doctor.id}:`, err);
          specialtiesMap[doctor.id] = [];
        }
      }
      
      setDoctorSpecialties(specialtiesMap);
    };

    if (doctors.length > 0) {
      fetchDoctorSpecialties();
    }
  }, [doctors]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có thông tin';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Không có thông tin';
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Không có thông tin';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Stethoscope size={24} />
            </div>
            <div className="logo-text">Hệ thống Y tế</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <ArrowLeft size={16} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Page Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '32px' 
          }}>
            <button 
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={20} />
              Quay lại
            </button>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}>
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                Danh sách bác sĩ
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                Tất cả bác sĩ trong hệ thống
              </p>
            </div>
          </div>

          {/* Doctors List */}
          {doctors.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={64} className="empty-state-icon" />
              <h3>Chưa có bác sĩ nào</h3>
              <p>Hiện tại chưa có bác sĩ nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gap: '20px'
            }}>
              {doctors.map((doctor) => (
                <div key={doctor.id} className="appointment-card">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                        background: doctor.profile_image ? 'none' : 'linear-gradient(135deg, #667eea, #764ba2)'
                      }}>
                        {doctor.profile_image ? (
                          <img 
                            src={doctor.profile_image} 
                            alt={doctor.full_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <User size={24} color="white" />
                        )}
                      </div>
                      <div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '20px', 
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          {doctor.full_name}
                        </h3>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Mail size={14} />
                          {doctor.email}
                        </p>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Phone size={14} />
                          {doctor.phone}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <Calendar size={16} />
                        {doctor.appointment_count} lịch hẹn
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị khoa của bác sĩ */}
                  <div style={{ 
                    marginTop: '16px',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      <Stethoscope size={16} style={{ marginRight: '8px' }} />
                      Khoa chuyên môn:
                    </h4>
                    {doctorSpecialties[doctor.id] && doctorSpecialties[doctor.id].length > 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '8px' 
                      }}>
                        {doctorSpecialties[doctor.id].map((specialty) => (
                          <span key={specialty.id} style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {specialty.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ 
                        margin: 0, 
                        color: '#6b7280', 
                        fontSize: '14px',
                        fontStyle: 'italic'
                      }}>
                        Chưa có khoa chuyên môn
                      </p>
                    )}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <Phone size={16} color="#6b7280" />
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        {doctor.phone || 'Chưa có số điện thoại'}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorList;
