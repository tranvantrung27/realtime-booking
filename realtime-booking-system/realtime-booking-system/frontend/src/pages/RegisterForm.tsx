import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Heart, Shield, User, Phone } from 'lucide-react';
import {
  wrapperStyle,
  floatingIcons,
  iconFloatingStyle,
  formCard,
  headerBox,
  iconBox,
  headerTitle,
  headerSub,
  formSection,
  title,
  errorBox,
  inputGroup,
  inputField,
  iconLeft,
  togglePassword,
  submitButton,
  demoInfo,
} from './styles/LoginFormStyle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Mặc định là bệnh nhân
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const res = await axios.post('/api/auth/register', dataToSend);
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Đăng ký thành công!');
      navigate('/'); // Chuyển hướng về trang chủ sau khi đăng ký
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={wrapperStyle}>
      <div style={floatingIcons}>
        <Heart size={20} style={iconFloatingStyle('#1976d2', '20%', '15%', 'float1')} />
        <Shield size={18} style={iconFloatingStyle('#1976d2', '60%', '85%', 'float2')} />
        <Heart size={16} style={iconFloatingStyle('#1976d2', '80%', '20%', 'float3')} />
        <Shield size={22} style={iconFloatingStyle('#1976d2', '30%', '80%', 'float4')} />
      </div>

      <div style={{...formCard, maxWidth: '500px'}}>
        <div style={headerBox}>
          <div style={iconBox}>
            <Heart size={32} style={{ color: '#fff', animation: 'heartbeat 2s infinite' }} />
          </div>
          <h1 style={headerTitle}>Hệ thống Y tế</h1>
          <p style={headerSub}>Đăng ký tài khoản</p>
        </div>

        <div style={formSection}>
          <h2 style={title}>Đăng ký</h2>
          {error && <div style={errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={inputGroup}>
              <User size={20} style={iconLeft} />
              <input
                type="text"
                name="full_name"
                placeholder="Họ và tên"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={inputField}
              />
            </div>

            <div style={inputGroup}>
              <Mail size={20} style={iconLeft} />
              <input
                type="email"
                name="email"
                placeholder="Địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputField}
              />
            </div>

            <div style={inputGroup}>
              <Phone size={20} style={iconLeft} />
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                required
                style={inputField}
              />
            </div>

            <div style={inputGroup}>
              <Lock size={20} style={iconLeft} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputField}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={togglePassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={inputGroup}>
              <Lock size={20} style={iconLeft} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={inputField}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={togglePassword}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Ẩn lựa chọn vai trò, mặc định là bệnh nhân */}
            <input type="hidden" name="role" value="patient" />

            <button type="submit" disabled={isLoading} style={submitButton(isLoading)}>
              {isLoading ? (
                <>
                  <div style={{
                    width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }} />
                  Đang xử lý...
                </>
              ) : 'Đăng ký'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#555'
          }}>
            <p>Đã có tài khoản? <button 
              onClick={goToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Đăng nhập
            </button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;