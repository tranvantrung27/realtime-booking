import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Heart, Shield, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const LoginForm = ({ onLoginSuccess = () => {} }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const goToRegister = () => {
    navigate('/register');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setError('');
      onLoginSuccess();
    } catch {
      setError('Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={floatingIcons}>
        <Heart size={20} style={iconFloatingStyle('#1976d2', '20%', '15%', 'float1')} />
        <Shield size={18} style={iconFloatingStyle('#1976d2', '60%', '85%', 'float2')} />
        <Heart size={16} style={iconFloatingStyle('#1976d2', '80%', '20%', 'float3')} />
        <Shield size={22} style={iconFloatingStyle('#1976d2', '30%', '80%', 'float4')} />
      </div>

      <div style={formCard}>
        <div style={headerBox}>
          <div style={iconBox}>
            <Heart size={32} style={{ color: '#fff', animation: 'heartbeat 2s infinite' }} />
          </div>
          <h1 style={headerTitle}>Hệ thống Y tế</h1>
          <p style={headerSub}>Đặt lịch khám bệnh</p>
        </div>

        <div style={formSection}>
          <h2 style={title}>Đăng nhập</h2>
          {error && <div style={errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={inputGroup}>
              <Mail size={20} style={iconLeft} />
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputField}
              />
            </div>

            <div style={inputGroup}>
              <Lock size={20} style={iconLeft} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputField}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={togglePassword}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={isLoading} style={submitButton(isLoading)}>
              {isLoading ? (
                <>
                  <div style={{
                    width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }} />
                  Đang xử lý...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div style={demoInfo}>
            <p><strong>Demo:</strong> demo@hospital.com / demo123</p>
          </div>
          
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#555'
          }}>
            <p>Chưa có tài khoản? <button 
              onClick={goToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <UserPlus size={16} />
              Đăng ký ngay
            </button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
