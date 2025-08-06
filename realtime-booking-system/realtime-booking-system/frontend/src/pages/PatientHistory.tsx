import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Stethoscope
} from 'lucide-react';
import { translateStatus, translateDateTime } from '../utils/translations';
import { socket } from '../../socket';

interface Appointment {
  id: number;
  appointment_time: string;
  status: string;
  note?: string;
  doctor_name: string;
  doctor_id: number;
  specialty_name?: string;
  created_at: string;
}

interface Patient {
  full_name: string;
  email: string;
  phone: string;
}

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

const PatientHistory: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [patientId, setPatientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Mặc định sắp xếp giảm dần (mới nhất lên đầu)

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      setPatientId(user.id);
    }
  }, []);

  // Fetch lịch sử khám bệnh
  const fetchPatientHistory = async (page = 1, status = '', sort = sortOrder) => {
    if (!patientId) return;
    
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.get(`/api/appointments/history/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page,
          limit: 10,
          status,
          sort // Thêm tham số sort
        }
      });
      
      setAppointments(res.data.appointments);
      setPatient(res.data.patient);
      setPagination(res.data.pagination);
      setIsLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử khám bệnh:', err);
      toast.error('Không thể tải lịch sử khám bệnh');
      setIsLoading(false);
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
      
      // Tham gia phòng người dùng
      socket.emit('user_connected', user.id);
      socket.emit('join_patient_room', user.id);
      
      // Lắng nghe sự kiện cập nhật lịch hẹn
      const handleUpdate = () => {
        console.log('📡 Nhận cập nhật lịch realtime');
        fetchPatientHistory(pagination.currentPage, statusFilter, sortOrder);
      };

      socket.on('appointment_updated', handleUpdate);
      socket.on('appointment_created', handleUpdate);

      return () => {
        socket.off('appointment_updated', handleUpdate);
        socket.off('appointment_created', handleUpdate);
      };
    }
  }, [patientId, pagination.currentPage, statusFilter, sortOrder]);

  // Gọi API khi component mount hoặc khi các filter thay đổi
  useEffect(() => {
    if (patientId) {
      fetchPatientHistory(pagination.currentPage, statusFilter, sortOrder);
    }
  }, [patientId, statusFilter, pagination.currentPage, sortOrder]);

  // Xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchPatientHistory(newPage, statusFilter, sortOrder);
    }
  };

  // Xử lý thay đổi filter trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    fetchPatientHistory(1, e.target.value, sortOrder);
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as 'asc' | 'desc';
    setSortOrder(newSortOrder);
    fetchPatientHistory(1, statusFilter, newSortOrder);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
    fetchPatientHistory(1, statusFilter, sortOrder);
  };

  // Hiển thị badge trạng thái
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
    <div className="patient-history fade-in">
      {/* Tiêu đề và thông tin bệnh nhân */}
      <div className="panel-header">
        <h2>Lịch sử khám bệnh</h2>
        {patient && (
          <div className="patient-info">
            <div className="info-item">
              <User size={16} />
              <span>{patient.full_name}</span>
            </div>
            {patient.email && (
              <div className="info-item">
                <span>{patient.email}</span>
              </div>
            )}
            {patient.phone && (
              <div className="info-item">
                <span>{patient.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <Search size={16} />
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Lọc theo trạng thái */}
          <div className="filter-container">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="status-filter"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
              <option value="done">Hoàn thành</option>
            </select>
          </div>

          {/* Sắp xếp theo thời gian */}
          <div className="filter-container">
            <Clock size={16} />
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="status-filter"
            >
              <option value="desc">Mới nhất trước</option>
              <option value="asc">Cũ nhất trước</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách lịch sử khám bệnh */}
      {!Array.isArray(appointments) || appointments.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} className="empty-state-icon" />
          <h3>Chưa có lịch sử khám bệnh</h3>
          <p>Bạn chưa có lịch sử khám bệnh nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="appointment-history-list">
          {appointments.map((appointment) => {
            const { date, time } = translateDateTime(appointment.appointment_time);
            
            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h4>Lịch khám #{appointment.id}</h4>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="appointment-details">
                  <div className="detail-item">
                    <User size={18} color="#667eea" />
                    <div>
                      <div className="detail-label">Bác sĩ</div>
                      <div className="detail-value">{appointment.doctor_name}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Stethoscope size={18} color="#667eea" />
                    <div>
                      <div className="detail-label">Chuyên khoa</div>
                      <div className="detail-value">{appointment.specialty_name || 'Không có thông tin'}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Calendar size={18} color="#667eea" />
                    <div>
                      <div className="detail-label">Ngày khám</div>
                      <div className="detail-value">{date}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Clock size={18} color="#667eea" />
                    <div>
                      <div className="detail-label">Giờ khám</div>
                      <div className="detail-value">{time}</div>
                    </div>
                  </div>
                </div>

                {appointment.note && (
                  <div className="appointment-note">
                    <div className="note-label">Ghi chú:</div>
                    <p className="note-content">{appointment.note}</p>
                  </div>
                )}
                
                {appointment.status === 'done' && (
                  <div className="view-details-button">
                    <FileText size={16} />
                    Xem chi tiết kết quả khám
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="pagination-button"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="pagination-info">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;