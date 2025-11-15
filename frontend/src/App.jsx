import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, logout } = useAuth();

  if (user) {
    return <Dashboard />;
  }

  return isLogin ? 
    <Login switchToRegister={() => setIsLogin(false)} /> : 
    <Register switchToLogin={() => setIsLogin(true)} />;
};

function App() {
  return (
    <AuthProvider>
      <AuthApp />
    </AuthProvider>
  );
}

export default App;