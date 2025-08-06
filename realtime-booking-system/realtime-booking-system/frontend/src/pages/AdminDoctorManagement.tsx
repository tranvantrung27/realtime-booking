import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Stethoscope,
  Search,
  Filter,
  ArrowLeft,
  Home,
  LogOut,
  Eye,
  Users,
  Award,
  MapPin,
  Clock
} from 'lucide-react';
import '../pages/css/AdminDoctorManagement.css';

interface Doctor {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  profile_image?: string;
  appointment_count: number;
  specialties?: string[];
}

interface Specialty {
  id: number;
  name: string;
  description: string;
}

const AdminDoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    specialtyIds: [] as number[]
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get('/api/specialties');
      setSpecialties(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khoa');
    }
  };

  const handleAddDoctor = async () => {
    try {
      await axios.post('/api/admin/doctors', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Thêm bác sĩ thành công');
      setShowAddModal(false);
      resetForm();
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi thêm bác sĩ');
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      await axios.put(`/api/admin/doctors/${selectedDoctor.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật bác sĩ thành công');
      setShowEditModal(false);
      resetForm();
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật bác sĩ');
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bác sĩ này?')) return;
    
    try {
      await axios.delete(`/api/admin/users/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa bác sĩ thành công');
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi xóa bác sĩ');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      specialtyIds: []
    });
    setSelectedDoctor(null);
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone,
      password: '',
      specialtyIds: []
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-text">Đang tải dữ liệu...</p>
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
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
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
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
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
            <button
              onClick={openAddModal}
              style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Plus size={18} />
              Thêm Bác sĩ
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-content">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-text">
                  <h3>{doctors.length}</h3>
                  <p>Tổng bác sĩ</p>
                </div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-content">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-text">
                  <h3>{doctors.reduce((sum, doctor) => sum + doctor.appointment_count, 0)}</h3>
                  <p>Tổng lịch hẹn</p>
                </div>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-content">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-text">
                  <h3>{specialties.length}</h3>
                  <p>Khoa chuyên môn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-field"
              />
            </div>
          </div>

          {/* Doctors List */}
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={64} className="empty-state-icon" />
              <h3>Chưa có bác sĩ nào</h3>
              <p>Hiện tại chưa có bác sĩ nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-header">
                    <div className="doctor-info">
                      <div className="doctor-avatar">
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
                          <img 
                            src={`https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${doctor.id % 99}.jpg`} 
                            alt={doctor.full_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=random&color=fff`;
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="doctor-name">{doctor.full_name}</h3>
                        <p className="doctor-id">ID: {doctor.id}</p>
                      </div>
                    </div>
                    <div className="doctor-actions">
                      <button
                        onClick={() => openEditModal(doctor)}
                        className="action-btn edit-btn"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="action-btn delete-btn"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-item">
                      <Mail size={16} color="#6b7280" />
                      <span className="detail-text">{doctor.email}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} color="#6b7280" />
                      <span className="detail-text">{doctor.phone}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} color="#6b7280" />
                      <span className="detail-text">{doctor.appointment_count} lịch hẹn</span>
                    </div>

                  </div>

                  <div className="doctor-footer">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="footer-btn primary-btn"
                    >
                      <Edit size={16} />
                      Sửa thông tin
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="footer-btn danger-btn"
                    >
                      <Trash2 size={16} />
                      Xóa bác sĩ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2 className="modal-title">Thêm Bác sĩ Mới</h2>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); handleAddDoctor(); }}>
                  <div className="form-group">
                    <label className="form-label">Họ tên</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="form-input"
                      placeholder="Nhập họ tên bác sĩ"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="form-input"
                      placeholder="Để trống để sử dụng mặc định: 123456"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Khoa chuyên môn</label>
                    <select
                      multiple
                      value={formData.specialtyIds.map(String)}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => Number(option.value));
                        setFormData({...formData, specialtyIds: values});
                      }}
                      className="form-select"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="modal-btn cancel-btn"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="modal-btn confirm-btn"
                    >
                      Thêm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEditModal && selectedDoctor && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}>
                <h2 className="modal-title">Sửa Thông Tin Bác sĩ</h2>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); handleEditDoctor(); }}>
                  <div className="form-group">
                    <label className="form-label">Họ tên</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="form-input"
                      placeholder="Nhập họ tên bác sĩ"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Khoa chuyên môn</label>
                    <select
                      multiple
                      value={formData.specialtyIds.map(String)}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => Number(option.value));
                        setFormData({...formData, specialtyIds: values});
                      }}
                      className="form-select"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="modal-btn cancel-btn"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="modal-btn confirm-btn"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDoctorManagement; 