// src/pages/DoctorDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Stethoscope, Calendar, Check, XCircle, Clock, User, FileText, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { translateStatus, translateDateTime } from '../utils/translations';
import { socket } from '../../socket';

interface Appointment {
  id: number;
  appointment_time: string;
  status: string;
  note?: string;
  patient_name: string;
}

interface AppointmentResponse {
  appointments: Appointment[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDoctorAppointments = async (page = 1) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/appointments/doctor', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page,
          limit: 10
        }
      });
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (res.data && Array.isArray(res.data.appointments)) {
        // Cấu trúc mới với pagination
        setAppointments(res.data.appointments);
        setCurrentPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
      } else if (Array.isArray(res.data)) {
        // Cấu trúc cũ (mảng trực tiếp)
        setAppointments(res.data);
      } else {
        // Không phải mảng
        console.error('Dữ liệu không đúng định dạng:', res.data);
        setAppointments([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Không thể lấy danh sách lịch hẹn:', err);
      setAppointments([]);
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`/api/appointments/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(`✅ Cập nhật trạng thái thành công!`);
      fetchDoctorAppointments(currentPage);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error('❌ Cập nhật trạng thái thất bại!');
    }
  };

  // Kết nối socket khi component mount
  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user && user.id) {
      // Kết nối socket nếu chưa kết nối
      if (!socket.connected) {
        socket.connect();
      }
      
      // Tham gia phòng bác sĩ
      socket.emit('join_doctor_room', user.id);
      console.log('🔌 Kết nối socket cho DoctorDashboard');
      
      // Lắng nghe sự kiện lịch hẹn mới
      const handleNewAppointment = () => {
        console.log('📡 Nhận lịch mới realtime cho bác sĩ');
        toast.info('🔔 Có lịch khám mới!');
        fetchDoctorAppointments(currentPage);
      };
      
      // Lắng nghe sự kiện cập nhật lịch hẹn
      const handleAppointmentUpdate = () => {
        console.log('📡 Nhận cập nhật lịch realtime');
        fetchDoctorAppointments(currentPage);
      };
      
      socket.on('new_appointment', handleNewAppointment);
      socket.on('appointment_updated', handleAppointmentUpdate);
      
      return () => {
        console.log('🔌 Ngắt kết nối socket cho DoctorDashboard');
        socket.off('new_appointment', handleNewAppointment);
        socket.off('appointment_updated', handleAppointmentUpdate);
      };
    }
  }, [currentPage]);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    fetchDoctorAppointments(currentPage);
  }, [currentPage]);

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'done':
        return 'Hoàn thành';
      default:
        return 'Chờ xác nhận';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase() === 'confirmed' ? 'status-confirmed' :
                       status.toLowerCase() === 'cancelled' ? 'status-cancelled' :
                       status.toLowerCase() === 'done' ? 'status-confirmed' :
                       'status-pending';
    
    return (
      <div className={`status-badge ${statusClass}`}>
        <span>{translateStatus(status)}</span>
      </div>
    );
  };

  // Đếm số lượng lịch hẹn theo trạng thái
  const countAppointmentsByStatus = (status: string) => {
    if (!Array.isArray(appointments)) return 0;
    return appointments.filter(a => a.status.toLowerCase() === status.toLowerCase()).length;
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
            <div className="logo-text">Hệ thống Y tế - Bác sĩ</div>
          </div>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
          }}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="main-panel fade-in">
            <div className="panel-title">
              <Calendar className="panel-icon" />
              <h2>Dashboard Bác sĩ</h2>
            </div>

            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Calendar size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {Array.isArray(appointments) ? appointments.length : 0}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Tổng lịch hẹn
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Check size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {countAppointmentsByStatus('confirmed')}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Đã xác nhận
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Clock size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {countAppointmentsByStatus('pending')}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Chờ xác nhận
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <FileText size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {countAppointmentsByStatus('done')}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Hoàn thành
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            {!Array.isArray(appointments) || appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} className="empty-state-icon" />
                <h3>Chưa có lịch hẹn nào</h3>
                <p>Hiện tại chưa có lịch hẹn nào trong hệ thống.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {appointments.map((appointment) => {
                  const { date, time } = translateDateTime(appointment.appointment_time);
                  
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

                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        marginTop: '16px',
                        flexWrap: 'wrap'
                      }}>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(appointment.id, 'confirmed')}
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
                              <Check size={16} />
                              Xác nhận
                            </button>
                            <button
                              onClick={() => updateStatus(appointment.id, 'cancelled')}
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
                              <X size={16} />
                              Hủy
                            </button>
                          </>
                        )}

                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'done')}
                            style={{
                              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                            <FileText size={16} />
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '24px',
                gap: '16px'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  Trước
                </button>
                
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Tiếp
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;