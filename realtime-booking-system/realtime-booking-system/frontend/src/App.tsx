import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { LogOut, Stethoscope, Calendar, Users, FileText, History } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ChatWidget from './components/ChatWidget';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import DoctorList from './pages/DoctorList';
import AppointmentForm from './pages/AppointmentForm';
import AppointmentList from './pages/AppointmentList';
import PatientHistory from './pages/PatientHistory';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctorList from './pages/AdminDoctorList';
import AdminPatientList from './pages/AdminPatientList';
import AdminDoctorManagement from './pages/AdminDoctorManagement';
import AdminSpecialtyManagement from './pages/AdminSpecialtyManagement';
import LoginLayout from './layouts/LoginLayout';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
// import './pages/css/PatientHistory.css';
import { socket } from '../socket';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('booking');
  const [socketConnected, setSocketConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Kết nối socket khi đăng nhập
  useEffect(() => {
    if (isLoggedIn && user && user.id) {
      try {
        // Lắng nghe sự kiện kết nối thành công
        const handleConnect = () => {
          console.log('🟢 Socket connected successfully, ID:', socket.id);
          setSocketConnected(true);
          
          // Đăng ký người dùng sau khi kết nối thành công
          socket.emit('user_connected', user.id);
          
          // Tham gia phòng theo vai trò
          if (user.role === 'doctor') {
            socket.emit('join_doctor_room', user.id);
          } else if (user.role === 'patient') {
            socket.emit('join_patient_room', user.id);
          }
        };

        // Lắng nghe sự kiện lỗi kết nối
        const handleConnectError = (error: any) => {
          console.error('❌ Socket connection error:', error);
          setSocketConnected(false);
        };

        // Lắng nghe sự kiện ngắt kết nối
        const handleDisconnect = (reason: string) => {
          console.log('🔴 Socket disconnected:', reason);
          setSocketConnected(false);
        };

        // Đăng ký các listener
        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
        socket.on('disconnect', handleDisconnect);

        // Kết nối socket
        if (!socket.connected) {
          socket.connect();
        } else {
          handleConnect(); // Nếu đã kết nối, vẫn gọi hàm xử lý
        }

        // Cleanup khi component unmount
        return () => {
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleConnectError);
          socket.off('disconnect', handleDisconnect);
          socket.disconnect();
        };
      } catch (error) {
        console.error('❌ Error setting up socket connection:', error);
      }
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket.connected) {
      socket.disconnect();
    }
    setSocketConnected(false);
    setIsLoggedIn(false);
  };

  // Bọc nội dung trong Router để sử dụng định tuyến
  return (
    <Router>
      <ChatWidget />
      <Routes>
        <Route path="/register" element={
          !isLoggedIn ? (
            <ErrorBoundary>
              <LoginLayout>
                <RegisterForm />
                <ToastContainer position="top-right" autoClose={3000} />
              </LoginLayout>
            </ErrorBoundary>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/login" element={
          !isLoggedIn ? (
            <ErrorBoundary>
              <LoginLayout>
                <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
                <ToastContainer position="top-right" autoClose={3000} />
              </LoginLayout>
            </ErrorBoundary>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/*" element={
          isLoggedIn ? (
            <AuthenticatedApp 
              user={user} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              handleLogout={handleLogout}
              socketConnected={socketConnected}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

// Component cho người dùng đã đăng nhập
const AuthenticatedApp = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  handleLogout,
  socketConnected
}: { 
  user: any, 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  handleLogout: () => void,
  socketConnected: boolean
}) => {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin và Doctor có dashboard riêng
  if (user.role === 'doctor') {
    return (
      <ErrorBoundary>
        <MainLayout>
          <ToastContainer position="top-right" autoClose={3000} />
          <DoctorDashboard />
        </MainLayout>
      </ErrorBoundary>
    );
  }

  if (user.role === 'admin') {
    // Admin routes
    if (location.pathname === '/admin/doctors') {
      return (
        <ErrorBoundary>
          <AdminDoctorManagement />
          <ToastContainer position="top-right" autoClose={3000} />
        </ErrorBoundary>
      );
    }
    
    if (location.pathname === '/admin/patients') {
      return (
        <ErrorBoundary>
          <AdminPatientList />
          <ToastContainer position="top-right" autoClose={3000} />
        </ErrorBoundary>
      );
    }
    
    if (location.pathname === '/admin/specialties') {
      return (
        <ErrorBoundary>
          <AdminSpecialtyManagement />
          <ToastContainer position="top-right" autoClose={3000} />
        </ErrorBoundary>
      );
    }
    
    // Default admin dashboard
    return (
      <ErrorBoundary>
        <MainLayout>
          <ToastContainer position="top-right" autoClose={3000} />
          <AdminDashboard />
        </MainLayout>
      </ErrorBoundary>
    );
  }

  // Patient interface
  const renderMainContent = () => {
    switch (activeTab) {
      case 'booking':
        return (
          <div key="booking">
            <div className="panel-title">
              <FileText className="panel-icon" />
              Đặt lịch khám
            </div>
            <AppointmentForm />
          </div>
        );
      case 'appointments':
        return (
          <div key="appointments">
            <div className="panel-title">
              <Calendar className="panel-icon" />
              Lịch đã đặt
            </div>
            <AppointmentList />
          </div>
        );
      case 'doctors':
        return (
          <div key="doctors">
            <div className="panel-title">
              <Users className="panel-icon" />
              Danh sách bác sĩ
            </div>
            <DoctorList />
          </div>
        );
      case 'history':
        return (
          <div key="history">
            <div className="panel-title">
              <History className="panel-icon" />
              Lịch sử khám bệnh
            </div>
            <PatientHistory />
          </div>
        );
      default:
        return (
          <div key="booking">
            <div className="panel-title">
              <FileText className="panel-icon" />
              Đặt lịch khám
            </div>
            <AppointmentForm />
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Stethoscope size={24} />
              </div>
              <div className="logo-text">
                Hệ thống Y tế
                {!socketConnected && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#ff4d4f', 
                    marginLeft: '8px',
                    padding: '2px 6px',
                    background: 'rgba(255, 77, 79, 0.1)',
                    borderRadius: '4px'
                  }}>
                    Offline
                  </span>
                )}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: 8 }} />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-grid">
            {/* Sidebar */}
            <aside className="sidebar">
              <div 
                className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking')}
              >
                <FileText className="nav-icon" />
                Đặt lịch khám
              </div>
              <div 
                className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <Calendar className="nav-icon" />
                Lịch đã đặt
              </div>
              <div 
                className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
                onClick={() => setActiveTab('doctors')}
              >
                <Users className="nav-icon" />
                Danh sách bác sĩ
              </div>
              <div 
                className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History className="nav-icon" />
                Lịch sử khám bệnh
              </div>
            </aside>

            {/* Main Panel */}
            <div className="main-panel fade-in">
              {renderMainContent()}
            </div>
          </div>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  );
};

export default App;