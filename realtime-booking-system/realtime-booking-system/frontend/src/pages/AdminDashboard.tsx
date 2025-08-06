import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Stethoscope, Users, Calendar, Check, XCircle, Clock, User, FileText, Eye, Phone, Plus, Edit, Trash2, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { translateStatus, translateDateTime } from '../utils/translations';

interface Appointment {
  id: number;
  appointment_date?: string;
  appointment_time: string;
  status: string;
  notes?: string;
  doctor_name: string;
  patient_name: string;
  patient_phone?: string;
  created_at: string;
}

interface Stats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/admin/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Sắp xếp theo thứ tự mới nhất
      const sortedAppointments = res.data.sort((a: Appointment, b: Appointment) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAppointments(sortedAppointments);
      setIsLoading(false);
    } catch (err) {
      console.error('Không thể lấy danh sách lịch hẹn:', err);
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Không thể lấy thống kê:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  useEffect(() => {
    // Socket.io để cập nhật real-time
    const socket = (window as any).socket;
    if (socket) {
      console.log('🔌 Kết nối socket cho AdminDashboard');
      
      const handler = () => {
        console.log('📡 Nhận cập nhật realtime cho admin');
        fetchAppointments();
        fetchStats();
      };

      socket.on('new_appointment', handler);
      socket.on('appointment_updated', handler);
      return () => {
        console.log('🔌 Ngắt kết nối socket cho AdminDashboard');
        socket.off('new_appointment', handler);
        socket.off('appointment_updated', handler);
      };
    } else {
      console.warn('⚠️ Socket không khả dụng trong AdminDashboard');
    }
  }, []);

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Chờ xác nhận';
    }
  };

  const getStatusBadge = (status: string) => {
    let statusClass = 'status-pending';
    let statusText = 'Chờ xác nhận';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        statusClass = 'status-confirmed';
        statusText = 'Đã xác nhận';
        break;
      case 'cancelled':
        statusClass = 'status-cancelled';
        statusText = 'Đã hủy';
        break;
      case 'completed':
        statusClass = 'status-completed';
        statusText = 'Hoàn thành';
        break;
    }
    
    return (
      <div className={`status-badge ${statusClass}`}>
        <span>{statusText}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
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
            <div className="logo-text">Hệ thống Y tế - Admin</div>
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
              <h2>Dashboard Admin</h2>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => navigateTo('/admin/doctors')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Users size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                      Quản lý Bác sĩ
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Xem danh sách và quản lý bác sĩ
                    </p>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => navigateTo('/admin/patients')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <User size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                      Danh sách Bệnh nhân
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Xem danh sách bệnh nhân
                    </p>
                  </div>
                </div>
              </div>

              <div 
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => navigateTo('/admin/specialties')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Award size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                      Quản lý Khoa
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Thêm, sửa, xóa các khoa chuyên môn
                    </p>
                  </div>
                </div>
              </div>
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
                      {stats?.totalAppointments || appointments.length}
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
                      {stats?.confirmedAppointments || appointments.filter(a => a.status.toLowerCase() === 'confirmed').length}
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
                      {stats?.pendingAppointments || appointments.filter(a => a.status.toLowerCase() === 'pending').length}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Chờ xác nhận
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <XCircle size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {stats?.cancelledAppointments || appointments.filter(a => a.status.toLowerCase() === 'cancelled').length}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Đã hủy
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
                  <Check size={32} style={{ marginBottom: '12px' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {stats?.completedAppointments || appointments.filter(a => a.status.toLowerCase() === 'completed').length}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                      Hoàn thành
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            {appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} className="empty-state-icon" />
                <h3>Chưa có lịch hẹn nào</h3>
                <p>Hiện tại chưa có lịch hẹn nào trong hệ thống.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {appointments.map((appointment) => {
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
                            {appointment.patient_phone && (
                              <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} />
                                {appointment.patient_phone}
                              </div>
                            )}
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

                      {appointment.notes && (
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
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      <div style={{ 
                        background: '#f1f5f9',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginTop: '12px',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        Tạo lúc: {new Date(appointment.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
