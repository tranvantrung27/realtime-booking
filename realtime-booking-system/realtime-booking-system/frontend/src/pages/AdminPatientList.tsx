import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Stethoscope, Calendar, User, Eye, Phone, Mail, Edit, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  appointment_count: number;
  profile_image?: string;
  address?: string;
  gender?: string;
  date_of_birth?: string;
}

const AdminPatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleBack = () => {
    window.history.back();
  };

  const token = localStorage.getItem('token');

  const fetchPatients = async () => {
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
      toast.error('Không thể lấy danh sách bệnh nhân');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);
  
  const handleViewDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };
  
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone || '',
      password: ''
    });
    setShowEditModal(true);
  };
  
  const handleDelete = async (patientId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return;
    
    try {
      await axios.delete(`/api/admin/users/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa bệnh nhân thành công');
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi xóa bệnh nhân');
    }
  };
  
  const handleSaveEdit = async () => {
    if (!selectedPatient) return;
    
    try {
      await axios.put(`/api/admin/patients/${selectedPatient.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật thông tin bệnh nhân thành công');
      setShowEditModal(false);
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Lỗi khi cập nhật thông tin bệnh nhân');
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
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                Quản lý bệnh nhân
              </h1>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                Danh sách tất cả bệnh nhân trong hệ thống
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af' 
                }} 
                size={20} 
              />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 48px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
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
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <User size={32} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {patients.length}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                    Tổng bệnh nhân
                  </p>
                </div>
              </div>
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
            <div style={{ 
              display: 'grid', 
              gap: '20px'
            }}>
              {patients
                .filter(patient => 
                  patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  patient.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((patient) => (
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
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                        background: patient.profile_image ? 'none' : 'linear-gradient(135deg, #10b981, #059669)'
                      }}>
                        {patient.profile_image ? (
                          <img 
                            src={patient.profile_image} 
                            alt={patient.full_name}
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
                          {patient.full_name}
                        </h3>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Mail size={14} />
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      <Calendar size={16} />
                      {patient.appointment_count} lịch hẹn
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '16px'
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
                        {patient.phone || 'Chưa có số điện thoại'}
                      </span>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleViewDetail(patient)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: '#f3f4f6',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    >
                      <Eye size={16} />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleEdit(patient)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#bae6fd'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#e0f2fe'}
                    >
                      <Edit size={16} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              backgroundColor: '#10b981',
              padding: '20px 24px',
              color: 'white',
              position: 'relative'
            }}>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%'
                }}
              >
                &times;
              </button>
              <h2 style={{margin: 0, fontSize: '20px', fontWeight: 'bold'}}>
                Chi tiết bệnh nhân
              </h2>
            </div>
            <div style={{padding: '24px'}}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '16px'
                }}>
                  <User size={32} color="white" />
                </div>
                <div>
                  <h3 style={{margin: 0, fontSize: '24px', fontWeight: 'bold'}}>
                    {selectedPatient.full_name}
                  </h3>
                  <p style={{margin: '4px 0 0', color: '#6b7280'}}>
                    ID: {selectedPatient.id}
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{margin: '0 0 12px', fontSize: '16px', fontWeight: 'bold', color: '#4b5563'}}>
                  Thông tin liên hệ
                </h4>
                <div style={{display: 'grid', gap: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <Mail size={16} style={{marginRight: '8px', color: '#6b7280'}} />
                    <span>{selectedPatient.email}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <Phone size={16} style={{marginRight: '8px', color: '#6b7280'}} />
                    <span>{selectedPatient.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              {/* Đã xóa phần thông tin cá nhân (địa chỉ, giới tính, ngày sinh) */}

              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{margin: '0 0 12px', fontSize: '16px', fontWeight: 'bold', color: '#4b5563'}}>
                  Thông tin khác
                </h4>
                <div style={{display: 'grid', gap: '12px'}}>

                  <div style={{display: 'flex'}}>
                    <span style={{width: '120px', color: '#6b7280'}}>Lịch hẹn:</span>
                    <span>{selectedPatient.appointment_count} lịch hẹn</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '24px',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedPatient);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit size={16} />
                  Sửa thông tin
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              padding: '20px 24px',
              color: 'white',
              position: 'sticky',
              top: 0
            }}>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%'
                }}
              >
                &times;
              </button>
              <h2 style={{margin: 0, fontSize: '20px', fontWeight: 'bold'}}>
                Sửa thông tin bệnh nhân
              </h2>
            </div>
            <div style={{padding: '24px'}}>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}>
                <div style={{marginBottom: '16px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                {/* Đã xóa trường địa chỉ, giới tính, ngày sinh */}
                
                <div style={{marginBottom: '24px'}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Mật khẩu mới (để trống nếu không thay đổi)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatientList; 