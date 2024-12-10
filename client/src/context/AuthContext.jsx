import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return parsedUser ? {
        ...parsedUser,
        isAdmin: parsedUser.role === 'admin'
      } : null;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const login = (userData, token) => {
    console.log('Login data received:', { userData, token }); // Debug log
    const userWithAdmin = {
      ...userData,
      isAdmin: userData.role === 'admin'
    };
    console.log('Processed user data:', userWithAdmin); // Debug log
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
    setUser(userWithAdmin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
