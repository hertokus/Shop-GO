// src/context/AuthContext.js (sessionStorage ile Güncellenmiş)

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Artık { username: '...', fullName: '...' } gibi bir obje
  const [token, setToken] = useState(null);

  useEffect(() => {
    // localStorage yerine sessionStorage kullanılıyor
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUserString = sessionStorage.getItem('user');

    if (storedToken && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        setToken(storedToken);
        setUser(storedUser);
        console.log("AuthContext (useEffect): sessionStorage'dan oturum bilgisi bulundu.", { token: storedToken, user: storedUser });
      } catch (error) {
        console.error("AuthContext (useEffect): sessionStorage'dan user parse edilirken hata:", error);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = (userData) => {
    if (userData.access_token && userData.username) {
      // localStorage yerine sessionStorage kullanılıyor
      sessionStorage.setItem('accessToken', userData.access_token);

      const userToStore = {
        username: userData.username,
        fullName: userData.fullName || userData.username
      };
      sessionStorage.setItem('user', JSON.stringify(userToStore));

      setToken(userData.access_token);
      setUser(userToStore);
      console.log("AuthContext: Kullanıcı giriş yaptı ve state güncellendi (sessionStorage).", { token: userData.access_token, user: userToStore });
    } else {
      console.error("AuthContext: Login fonksiyonuna eksik veri geldi.", userData);
    }
  };

  const logout = () => {
    // localStorage yerine sessionStorage kullanılıyor
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log("AuthContext: Kullanıcı çıkış yaptı (sessionStorage temizlendi).");
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
