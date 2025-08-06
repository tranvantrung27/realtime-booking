import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Calendar, Eye, ArrowLeft, Stethoscope } from 'lucide-react';

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  appointment_count: number;
}

interface PatientDetails {
  patient: Patient;
  appointments: any[];
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      
      try {
        const res = await axios.get('/api/admin/patients', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatients(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Không thể lấy danh sách bệnh nhân:', err);
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleViewDetails = async (patientId: number) => {
    const token = localStorage.getItem('token');
    setIsLoadingDetails(true);
    
    try {
      const res = await axios.get(`/api/admin/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedPatient(res.data);
      setIsLoadingDetails(false);
    } catch (err) {
      console.error('Không thể lấy chi tiết bệnh nhân:', err);
      setIsLoadingDetails(false);
    }
  };

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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <User size={24} />
              </div>
              <div className="logo-text">Hệ thống Y tế - Admin</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            <div className="main-panel fade-in">
              <div className="panel-title">
                <User className="panel-icon" />
                Chi tiết bệnh nhân: {selectedPatient.patient.full_name}
              </div>

              {/* Patient Info */}
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
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
                    <User size={32} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {selectedPatient.patient.full_name}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Bệnh nhân • {selectedPatient.appointments.length} lịch hẹn
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
                    <span>{selectedPatient.patient.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} />
                    <span>{selectedPatient.patient.phone}</span>
                  </div>

                </div>
              </div>

              {/* Appointments */}
              <div>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Lịch hẹn của bệnh nhân</h3>
                {selectedPatient.appointments.length === 0 ? (
                  <div className="empty-state">
                    <Calendar size={64} className="empty-state-icon" />
                    <h3>Chưa có lịch hẹn nào</h3>
                    <p>Bệnh nhân này chưa có lịch hẹn nào.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {selectedPatient.appointments.map((appointment) => {
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
                              <Stethoscope size={18} color="#667eea" />
                              <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Bác sĩ
                                </div>
                                <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                                  {appointment.doctor_name}
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
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <User size={24} />
            </div>
            <div className="logo-text">Hệ thống Y tế - Admin</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="main-panel fade-in">
            <div className="panel-title">
              <User className="panel-icon" />
              Quản lý bệnh nhân
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <User size={32} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {patients.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Tổng bệnh nhân</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <Calendar size={32} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {patients.reduce((sum, patient) => sum + patient.appointment_count, 0)}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Tổng lịch hẹn</div>
              </div>
            </div>

            {/* Patients List */}
            {patients.length === 0 ? (
              <div className="empty-state">
                <User size={64} className="empty-state-icon" />
                <h3>Chưa có bệnh nhân nào</h3>
                <p>Hiện tại chưa có bệnh nhân nào trong hệ thống.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {patients.map((patient) => (
                  <div key={patient.id} className="appointment-card">
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
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                        }}>
                          <User size={24} color="white" />
                        </div>
                        <div>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '20px', 
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '8px'
                          }}>
                            {patient.full_name}
                          </h3>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '14px',
                            color: '#666'
                          }}>
                            <Calendar size={16} />
                            <span>{patient.appointment_count} lịch hẹn</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleViewDetails(patient.id)}
                        disabled={isLoadingDetails}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
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
                        <Mail size={18} color="#667eea" />
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                            Email
                          </div>
                          <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                            {patient.email}
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
                        <Phone size={18} color="#667eea" />
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                            Số điện thoại
                          </div>
                          <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                            {patient.phone}
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
                          <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                            Ngày tham gia
                          </div>
                          <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                            {formatDate(patient.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientList; 