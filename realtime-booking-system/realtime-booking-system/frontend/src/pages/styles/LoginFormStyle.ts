// Enhanced LoginFormStyle.ts with beautiful animations

export const wrapperStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e1f5fe 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  padding: 20,
  position: 'relative' as const,
  overflow: 'hidden',
};

export const floatingIcons = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none' as const,
  zIndex: 1,
};

export const iconFloatingStyle = (color: string, top: string, left: string, animationName: string) => ({
  position: 'absolute' as const,
  top,
  left,
  color: `${color}33`, // Adding transparency
  animation: `${animationName} 6s ease-in-out infinite`,
  filter: 'blur(0.5px)',
});

export const formCard = {
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: 24,
  maxWidth: 440,
  width: '100%',
  boxShadow: `
    0 25px 50px rgba(25, 118, 210, 0.15),
    0 15px 35px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9)
  `,
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  zIndex: 10,
  position: 'relative' as const,
  animation: 'slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const headerBox = {
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  padding: '32px 20px',
  textAlign: 'center' as const,
  position: 'relative' as const,
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%)',
    borderRadius: '0 0 50% 50%',
  }
};

export const iconBox = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 20,
  marginBottom: 16,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  animation: 'fadeInDown 0.8s ease-out 0.2s both',
};

export const headerTitle = {
  color: '#ffffff',
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 4,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  animation: 'fadeInDown 0.8s ease-out 0.3s both',
};

export const headerSub = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 14,
  fontWeight: 500,
  animation: 'fadeInDown 0.8s ease-out 0.4s both',
};

export const formSection = {
  padding: '36px 32px 32px',
};

export const title = {
  textAlign: 'center' as const,
  color: '#1565c0',
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 32,
  position: 'relative' as const,
  animation: 'fadeInUp 0.8s ease-out 0.5s both',
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 40,
    height: 3,
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    borderRadius: 2,
  }
};

export const errorBox = {
  background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  color: '#c62828',
  padding: '16px 20px',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 20,
  border: '1px solid rgba(198, 40, 40, 0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  animation: 'errorSlide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
};

export const inputGroup = {
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
  animation: 'fadeInLeft 0.8s ease-out both',
};

export const iconLeft = {
  position: 'absolute' as const,
  left: 16,
  color: '#64b5f6',
  zIndex: 2,
  transition: 'all 0.3s ease',
};

export const inputField = {
  width: '100%',
  height: 54,
  padding: '0 52px',
  border: '2px solid rgba(25, 118, 210, 0.1)',
  borderRadius: 16,
  fontSize: 16,
  fontWeight: 500,
  background: 'rgba(227, 242, 253, 0.3)',
  color: '#1565c0',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '::placeholder': {
    color: '#90a4ae',
    fontWeight: 500,
  }
};

export const togglePassword = {
  position: 'absolute' as const,
  right: 16,
  background: 'none',
  border: 'none',
  color: '#64b5f6',
  cursor: 'pointer',
  padding: 8,
  borderRadius: 8,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
};

export const submitButton = (loading: boolean) => ({
  height: 54,
  background: loading
    ? 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)'
    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  border: 'none',
  borderRadius: 16,
  color: '#fff',
  fontSize: 16,
  fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
  marginTop: 8,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  position: 'relative' as const,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: loading 
    ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
    : '0 8px 25px rgba(25, 118, 210, 0.3)',
  animation: 'fadeInUp 0.8s ease-out 0.7s both',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
  }
});

export const demoInfo = {
  marginTop: 24,
  textAlign: 'center' as const,
  fontSize: 13,
  color: '#546e7a',
  background: 'rgba(69, 90, 100, 0.05)',
  border: '1px solid rgba(69, 90, 100, 0.1)',
  borderRadius: 8,
  padding: '12px 16px',
  animation: 'fadeIn 0.8s ease-out 0.8s both',
};

// Enhanced hover and focus effects
export const inputFieldHover = {
  borderColor: 'rgba(25, 118, 210, 0.3)',
  background: 'rgba(227, 242, 253, 0.5)',
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
};

export const inputFieldFocus = {
  borderColor: '#1976d2',
  background: 'rgba(255, 255, 255, 0.9)',
  transform: 'translateY(-2px)',
  boxShadow: `
    0 0 0 4px rgba(25, 118, 210, 0.1),
    0 8px 25px rgba(25, 118, 210, 0.15)
  `,
};

export const buttonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4)',
  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
};

export const buttonActive = {
  transform: 'translateY(0)',
  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
};

export const formCardHover = {
  transform: 'translateY(-3px)',
  boxShadow: `
    0 30px 60px rgba(25, 118, 210, 0.2),
    0 20px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9)
  `,
};

export const togglePasswordHover = {
  color: '#1976d2',
  background: 'rgba(25, 118, 210, 0.1)',
};

// Animation delays for staggered effects
export const getInputGroupStyle = (index: number) => ({
  ...inputGroup,
  animationDelay: `${0.6 + index * 0.1}s`,
});