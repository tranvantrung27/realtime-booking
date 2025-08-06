import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Stethoscope,
  Search,
  LogOut,
  Award,
  FileText,
  Users
} from 'lucide-react';
import '../pages/css/AdminDoctorManagement.css';

interface Specialty {
  id: number;
  name: string;
  description: string;
  doctor_count?: number;
}

const AdminSpecialtyManagement: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/specialties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialties(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khoa');
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = async () => {
    try {
      await axios.post('/api/admin/specialties', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Thêm khoa thành công');
      setShowAddModal(false);
      resetForm();
      fetchSpecialties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi thêm khoa');
      console.error('Error adding specialty:', error);
    }
  };

  const handleEditSpecialty = async () => {
    if (!selectedSpecialty) return;
    
    try {
      await axios.put(`/api/admin/specialties/${selectedSpecialty.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật khoa thành công');
      setShowEditModal(false);
      resetForm();
      fetchSpecialties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật khoa');
      console.error('Error updating specialty:', error);
    }
  };

  const handleDeleteSpecialty = async (specialtyId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoa này?')) return;
    
    try {
      await axios.delete(`/api/admin/specialties/${specialtyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa khoa thành công');
      fetchSpecialties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi xóa khoa');
      console.error('Error deleting specialty:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setSelectedSpecialty(null);
  };

  const openEditModal = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
            }}>
              <Award size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                Quản lý khoa
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                Danh sách tất cả khoa trong hệ thống
              </p>
            </div>
            <button
              onClick={openAddModal}
              style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Plus size={18} />
              Thêm Khoa
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card purple">
              <div className="stat-content">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-text">
                  <h3>{specialties.length}</h3>
                  <p>Tổng khoa</p>
                </div>
              </div>
            </div>
            <div className="stat-card blue">
              <div className="stat-content">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-text">
                  <h3>{specialties.reduce((sum, specialty) => sum + (specialty.doctor_count || 0), 0)}</h3>
                  <p>Tổng bác sĩ</p>
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
                placeholder="Tìm kiếm khoa theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-field"
              />
            </div>
          </div>

          {/* Specialties List */}
          {filteredSpecialties.length === 0 ? (
            <div className="empty-state">
              <Award size={64} className="empty-state-icon" />
              <h3>Chưa có khoa nào</h3>
              <p>Hiện tại chưa có khoa nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredSpecialties.map((specialty) => (
                <div key={specialty.id} className="doctor-card">
                  <div className="doctor-header">
                    <div className="doctor-info">
                      <div className="doctor-avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                        <Award size={24} color="white" />
                      </div>
                      <div>
                        <h3 className="doctor-name">{specialty.name}</h3>
                        <p className="doctor-id">ID: {specialty.id}</p>
                      </div>
                    </div>
                    <div className="doctor-actions">
                      <button
                        onClick={() => openEditModal(specialty)}
                        className="action-btn edit-btn"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialty(specialty.id)}
                        className="action-btn delete-btn"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-item">
                      <FileText size={16} color="#6b7280" />
                      <span className="detail-text">{specialty.description || 'Không có mô tả'}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} color="#6b7280" />
                      <span className="detail-text">{specialty.doctor_count || 0} bác sĩ</span>
                    </div>
                  </div>

                  <div className="doctor-footer">
                    <button
                      onClick={() => openEditModal(specialty)}
                      className="footer-btn primary-btn"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                    >
                      <Edit size={16} />
                      Sửa thông tin
                    </button>
                    <button
                      onClick={() => handleDeleteSpecialty(specialty.id)}
                      className="footer-btn danger-btn"
                    >
                      <Trash2 size={16} />
                      Xóa khoa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Specialty Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                <h2 className="modal-title">Thêm Khoa Mới</h2>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); handleAddSpecialty(); }}>
                  <div className="form-group">
                    <label className="form-label">Tên khoa</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input"
                      placeholder="Nhập tên khoa"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="form-input"
                      placeholder="Nhập mô tả về khoa"
                      rows={4}
                    />
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
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                    >
                      Thêm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Specialty Modal */}
        {showEditModal && selectedSpecialty && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                <h2 className="modal-title">Sửa Thông Tin Khoa</h2>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); handleEditSpecialty(); }}>
                  <div className="form-group">
                    <label className="form-label">Tên khoa</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input"
                      placeholder="Nhập tên khoa"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="form-input"
                      placeholder="Nhập mô tả về khoa"
                      rows={4}
                    />
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
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
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

export default AdminSpecialtyManagement;