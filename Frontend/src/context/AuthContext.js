// src/context/AuthContext.js KODU:

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Context'i oluştur
const AuthContext = createContext(null);

// 2. Provider Component'i oluştur (Uygulamayı saracak)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('accessToken')); 

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username'); 
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({ username: storedUsername }); 
    }
  }, []);

  const login = (userData) => {
    if (userData.access_token && userData.username) {
      localStorage.setItem('accessToken', userData.access_token);
      localStorage.setItem('username', userData.username); 
      setToken(userData.access_token);
      setUser({ username: userData.username }); 
      console.log("AuthContext: Kullanıcı giriş yaptı ve state güncellendi.", { username: userData.username });
    } else {
       console.error("AuthContext: Login fonksiyonuna eksik veri geldi.", userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username'); 
    setToken(null);
    setUser(null); 
    console.log("AuthContext: Kullanıcı çıkış yaptı.");
  };

  const value = {
    isAuthenticated: !!token, 
    user, 
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Context'i kullanmak için özel bir hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};