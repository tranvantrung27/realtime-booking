const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {children}
    </div>
  );
};

export default LoginLayout;
