// 📁 frontend/src/pages/AppointmentList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, FileText, Check, XCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { translateStatus, translateDateTime } from '../utils/translations';
import { socket } from '../../socket';

interface Appointment {
  id: number;
  appointment_time: string;
  status: string;
  note?: string;
  doctor_name: string;
  patient_name?: string;
}

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = async (page = 1, status = '') => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page,
          limit: 10,
          status
        }
      });
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (res.data && Array.isArray(res.data.appointments)) {
        // Cấu trúc mới với pagination
        setAppointments(res.data.appointments);
        setPagination(res.data.pagination);
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

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    fetchAppointments(pagination.currentPage, statusFilter);
  }, [pagination.currentPage, statusFilter]);

  // Kết nối socket
  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user && user.id) {
      // Kết nối socket nếu chưa kết nối
      if (!socket.connected) {
        socket.connect();
      }
      
      // Tham gia phòng người dùng
      socket.emit('user_connected', user.id);
      socket.emit('join_patient_room', user.id);
      
      // Lắng nghe sự kiện lịch hẹn mới
      const handleNew = () => {
        console.log('📡 Nhận lịch mới realtime');
        fetchAppointments(pagination.currentPage, statusFilter);
      };
      
      // Lắng nghe sự kiện cập nhật lịch hẹn
      const handleUpdate = () => {
        console.log('📡 Nhận cập nhật lịch realtime');
        toast.info('📢 Lịch khám của bạn đã được cập nhật!');
        fetchAppointments(pagination.currentPage, statusFilter);
      };

      socket.on('new_appointment', handleNew);
      socket.on('appointment_updated', handleUpdate);
      socket.on('appointment_created', handleNew);

      return () => {
        socket.off('new_appointment', handleNew);
        socket.off('appointment_updated', handleUpdate);
        socket.off('appointment_created', handleNew);
      };
    }
  }, [pagination.currentPage, statusFilter]);

  // Xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage, statusFilter);
    }
  };

  // Xử lý thay đổi filter trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    fetchAppointments(1, e.target.value);
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase() === 'confirmed' ? 'status-confirmed' :
                       status.toLowerCase() === 'cancelled' ? 'status-cancelled' :
                       status.toLowerCase() === 'done' ? 'status-done' :
                       'status-pending';
    
    return (
      <div className={`status-badge ${statusClass}`}>
        <span>{translateStatus(status)}</span>
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

  return (
    <div className="fade-in">
      {/* Thanh lọc */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="done">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Danh sách lịch hẹn */}
      {!Array.isArray(appointments) || appointments.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} className="empty-state-icon" />
          <h3>Chưa có lịch hẹn nào</h3>
          <p>Bạn chưa có lịch hẹn nào trong hệ thống.</p>
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
                    Lịch khám #{appointment.id}
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
                    <Clock size={18} color="#667eea" />
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

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '24px',
          gap: '16px'
        }}>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: pagination.currentPage === 1 ? '#f5f5f5' : 'white',
              cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: pagination.currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span>
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: pagination.currentPage === pagination.totalPages ? '#f5f5f5' : 'white',
              cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
              opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;