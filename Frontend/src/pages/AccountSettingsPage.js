// src/pages/AccountSettingsPage.js (Tam ve Düzeltilmiş Hali)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AccountSettingsPage.css';

const AccountSettingsPage = () => {
  // useAuth hook'undan gerekli değerleri ve fonksiyonları alıyoruz
  const { user, token, updateUserProfile } = useAuth();
  const navigate = useNavigate(); // useNavigate hook'u burada tanımlanmalı

  // Form verileri ve durumları için state'leri tanımlıyoruz
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Kullanıcı bilgileri yüklendiğinde veya değiştiğinde formu doldur
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Formdaki input değişikliklerini state'e yansıt
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Kullanıcı yazmaya başladığında hata ve başarı mesajlarını temizle
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  // Form gönderildiğinde çalışacak fonksiyon (en son güncellenen hali)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      setIsLoading(false);
      return;
    }
    if (formData.newPassword && !formData.currentPassword) {
      setError('Yeni şifre belirlemek için mevcut şifrenizi girmelisiniz.');
      setIsLoading(false);
      return;
    }

    const payload = {};
    let formChanged = false;

    // Sadece gerçekten değişen alanları payload'a ekle
    if (user && formData.username && formData.username !== user.username) {
      payload.username = formData.username;
      formChanged = true;
    }
    if (user && formData.email && formData.email !== user.email) {
      payload.email = formData.email;
      formChanged = true;
    }
    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
      formChanged = true;
    }

    // Eğer hiçbir değişiklik yapılmadıysa (veya payload boşsa) API isteği gönderme
    if (!formChanged || Object.keys(payload).length === 0) {
        setSuccessMessage("Değişiklik yapılmadı veya güncellenecek bir bilgi girilmedi.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data;
      let responseTextForError = '';

      if (!response.ok) {
        try {
          const clonedResponse = response.clone();
          responseTextForError = await clonedResponse.text();
          data = await response.json();

          let detailedErrorMessage = `HTTP Durumu: ${response.status}`;
          if (data && data.message) {
            detailedErrorMessage += ` - Sunucu Mesajı: ${data.message}`;
          } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            detailedErrorMessage += ` - Sunucu Detayları: ${JSON.stringify(data)}`;
          } else if (responseTextForError) {
            detailedErrorMessage += ` - Ham Sunucu Yanıtı (JSON Değil?): ${responseTextForError.substring(0, 200)}...`;
          }
          throw new Error(detailedErrorMessage);

        } catch (jsonOrTextError) {
          let fallbackErrorMessage = `HTTP Durumu: ${response.status}. Sunucu yanıtı JSON olarak işlenemedi veya okunamadı.`;
          if (responseTextForError) {
              fallbackErrorMessage += ` Yanıtın başı: ${responseTextForError.substring(0, 200)}...`;
          }
          console.error("İç Hata (JSON parse/text okuma):", jsonOrTextError);
          console.error("Ham sunucu yanıtı (eğer alınabildiyse):", responseTextForError);
          throw new Error(fallbackErrorMessage);
        }
      }

      data = await response.json();
      setSuccessMessage(data.message || 'Profil başarıyla güncellendi!');
      
      if (data.user && updateUserProfile) {
        updateUserProfile(data.user);
        console.log("AuthContext, updateUserProfile ile güncellendi.");
      }

      setFormData(prev => ({
        ...prev,
        username: data.user ? data.user.username : prev.username,
        email: data.user ? data.user.email : prev.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));

    } catch (err) {
      setError(err.message || 'Profil güncellenirken bir genel hata oluştu.');
      console.error("Profil Güncelleme Son Hata Yakalayıcı:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı yoksa veya yükleniyorsa bir mesaj göster
  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Kullanıcı bilgileri yükleniyor veya giriş yapmanız gerekiyor...</div>;
  }

  // Formu render et
  return (
    <div className="account-settings-container">
      <h2>Hesap Ayarları</h2>
      <form onSubmit={handleSubmit} className="account-settings-form">
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="form-group">
          <label htmlFor="username">Kullanıcı Adı:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-posta:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <hr className="form-divider" />
        <h4>Şifre Değiştir (İsteğe Bağlı)</h4>

        <div className="form-group">
          <label htmlFor="currentPassword">Mevcut Şifre:</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Şifrenizi değiştirmek için girin"
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Yeni Şifre:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Yeni şifreniz (en az 6 karakter)"
            minLength="6"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmNewPassword">Yeni Şifre (Tekrar):</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            placeholder="Yeni şifrenizi doğrulayın"
            minLength="6"
            autoComplete="new-password"
          />
        </div>
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettingsPage;