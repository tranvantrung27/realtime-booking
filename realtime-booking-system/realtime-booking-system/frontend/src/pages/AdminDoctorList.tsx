import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Stethoscope, Calendar, User, Eye, Phone, Mail, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './css/AdminDoctorList.css';

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

interface DoctorDetails {
  doctor: Doctor;
  specialties: Specialty[];
  appointments: any[];
}

const AdminDoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [doctorSpecialties, setDoctorSpecialties] = useState<{[key: number]: Specialty[]}>({});

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
        const res = await axios.get('/api/admin/doctors', {
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
          const res = await axios.get(`/api/specialties/doctor/${doctor.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          specialtiesMap[doctor.id] = res.data;
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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase() === 'confirmed' ? 'status-confirmed' : 
                       status.toLowerCase() === 'cancelled' ? 'status-cancelled' : 
                       'status-pending';
    
    return (
      <div className={`status-badge ${statusClass}`}>
        <span>{status}</span>
      </div>
    );
  };

  const handleViewDetails = async (doctorId: number) => {
    const token = localStorage.getItem('token');
    setIsLoadingDetails(true);
    
    try {
      const res = await axios.get(`/api/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedDoctor(res.data);
      setIsLoadingDetails(false);
    } catch (err) {
      console.error('Không thể lấy chi tiết bác sĩ:', err);
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: number, doctorName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bác sĩ "${doctorName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('✅ Xóa bác sĩ thành công!');
      // Refresh danh sách
      const res = await axios.get('/api/admin/doctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDoctors(res.data);
    } catch (err) {
      console.error('Lỗi khi xóa bác sĩ:', err);
      toast.error('❌ Xóa bác sĩ thất bại!');
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

  if (selectedDoctor) {
    return (
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Stethoscope size={24} />
              </div>
              <div className="logo-text">Hệ thống Y tế - Admin</div>
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
            <div className="main-panel fade-in">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '32px' 
              }}>
                <button 
                  onClick={() => setSelectedDoctor(null)}
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
                <div className="panel-title">
                  <Stethoscope className="panel-icon" />
                  Chi tiết bác sĩ: {selectedDoctor.doctor.full_name}
                </div>
              </div>

              {/* Doctor Info */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '30px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Stethoscope size={32} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {selectedDoctor.doctor.full_name}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Bác sĩ • {selectedDoctor.appointments.length} lịch hẹn
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} />
                    <span>{selectedDoctor.doctor.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} />
                    <span>{selectedDoctor.doctor.phone}</span>
                  </div>

                </div>
              </div>

              {/* Appointments */}
              <div>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Lịch hẹn của bác sĩ</h3>
                {selectedDoctor.appointments.length === 0 ? (
                  <div className="empty-state">
                    <Calendar size={64} className="empty-state-icon" />
                    <h3>Chưa có lịch hẹn nào</h3>
                    <p>Bác sĩ này chưa có lịch hẹn nào.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {selectedDoctor.appointments.map((appointment) => {
                      const { date, time } = formatDateTime(appointment.appointment_time);
                       
                      return (
                        <div key={appointment.id} className="appointment-card">
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '16px'
                          }}>
                            <h4 style={{ margin: 0, color: '#333' }}>
                              Lịch hẹn #{appointment.id}
                            </h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                           
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px',
                              padding: '12px 16px',
                              background: '#f8f9fa',
                              borderRadius: '12px'
                            }}>
                              <User size={18} color="#667eea" />
                              <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Bệnh nhân
                                </div>
                                <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                                  {appointment.patient_name}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px',
                              padding: '12px 16px',
                              background: '#f8f9fa',
                              borderRadius: '12px'
                            }}>
                              <Calendar size={18} color="#667eea" />
                              <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Thời gian
                                </div>
                                <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                                  {date} lúc {time}
                                </div>
                              </div>
                            </div>
                          </div>

                          {appointment.note && (
                            <div style={{ 
                              background: '#f8f9fa',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              marginTop: '16px'
                            }}>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                Ghi chú:
                              </div>
                              <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                {appointment.note}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-doctor-list" style={{
      minHeight: '100vh',
      background: '#f8fafc'
    }}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Stethoscope size={24} />
            </div>
            <div className="logo-text">Hệ thống Y tế - Admin</div>
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
                Quản lý bác sĩ
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                Danh sách tất cả bác sĩ trong hệ thống
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '32px' 
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Stethoscope size={32} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {doctors.length}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                    Tổng bác sĩ
                  </p>
                </div>
              </div>
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
                       
                      <button 
                        onClick={() => handleViewDetails(doctor.id)}
                        disabled={isLoadingDetails}
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>

                      <button 
                        onClick={() => handleDeleteDoctor(doctor.id, doctor.full_name)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
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

export default AdminDoctorList; 