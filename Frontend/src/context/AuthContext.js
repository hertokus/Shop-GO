// src/context/AuthContext.js (updateUserProfile eklendi)

import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase'; // Yolunu kontrol et
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, fullName, email } gibi bir obje olabilir
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUserString = sessionStorage.getItem('user');

    if (storedToken && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        setToken(storedToken);
        setUser(storedUser); // Bu user objesi artık email de içerebilir
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

  const login = (loginData) => { // Parametre adını loginData olarak değiştirdim, userData ile karışmasın diye
    // loginData backend /api/login endpoint'inden gelen yanıtı temsil eder: { access_token, user_id, username, fullName }
    if (loginData.access_token && loginData.username) {
      sessionStorage.setItem('accessToken', loginData.access_token);

      const userToStore = {
        username: loginData.username,
        fullName: loginData.fullName || loginData.username,
        // Login sırasında email gelmiyorsa, bu alan burada undefined olabilir.
        // Eğer login sonrası /api/profile çağrılıp email alınıyorsa, o zaman eklenebilir.
        // Şimdilik login endpoint'inin response'una göre hareket ediyoruz.
        email: loginData.email || null // Eğer login response'unda email varsa diye ekledim, yoksa null olacak.
      };
      sessionStorage.setItem('user', JSON.stringify(userToStore));

      setToken(loginData.access_token);
      setUser(userToStore);
      console.log("AuthContext: Kullanıcı giriş yaptı ve state güncellendi (sessionStorage).", { token: loginData.access_token, user: userToStore });
    } else {
      console.error("AuthContext: Login fonksiyonuna eksik veri geldi.", loginData);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log("AuthContext: Kullanıcı çıkış yaptı (sessionStorage temizlendi).");
  };

  // YENİ: Kullanıcı bilgilerini güncelleme fonksiyonu
  const updateUserProfile = (updatedUserData) => {
    // updatedUserData backend /api/profile PUT endpoint'inden dönen user objesini temsil eder:
    // { id, username, email, fullName }
    if (updatedUserData && updatedUserData.username) {
      const userToStore = {
        username: updatedUserData.username,
        fullName: updatedUserData.fullName || updatedUserData.username, // Backend fullName'i username olarak gönderiyor
        email: updatedUserData.email || null // Backend'den email geliyor
      };
      sessionStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      console.log("AuthContext: Kullanıcı profili güncellendi.", { user: userToStore });
    } else {
      console.error("AuthContext: updateUserProfile fonksiyonuna eksik veri geldi.", updatedUserData);
    }
  };

  const value = {
    isAuthenticated: !!token,
    user, // Artık username, fullName ve potansiyel olarak email içerebilir
    token,
    login,
    logout,
    updateUserProfile, // YENİ fonksiyonu context değerine ekledik
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