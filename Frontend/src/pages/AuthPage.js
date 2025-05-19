// src/pages/AuthPage.js
import React, { useState, useContext } from 'react';
import './AuthPage.css'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import illustrationImage from './logo shopandgo.png'; 
import Modal from 'react-modal'; // Modal için import
import { auth, provider, signInWithPopup } from "../firebase";

// Modal'ı uygulama ana elemanına bağlama (erişilebilirlik için)
// App.js veya index.js dosyanızdaki ana div'in id'sini kullanın (genellikle 'root')
Modal.setAppElement('#root'); 

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  // --- Şifremi Unuttum Modalı için State'ler ---
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
  // --- Bitiş: Şifremi Unuttum Modalı için State'ler ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') { setRememberMe(checked); }
    else if (name === 'email') { setEmail(value); }
    else if (name === 'username') { setUsername(value); }
    else if (name === 'password') { setPassword(value); }
    else if (name === 'passwordConfirm') { setPasswordConfirm(value); }
    else if (name === 'forgotPasswordEmail') { setForgotPasswordEmail(value); } // Modal inputu için
  };

  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    if (password !== passwordConfirm) { setError('Şifreler eşleşmiyor.'); return; }
    const userData = { username: username, email: email, password: password };
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData), 
      });
      const data = await response.json(); 
      if (response.ok) { 
        alert(data.message || 'Kayıt başarılı! Lütfen giriş yapın.'); 
        setIsLogin(true); 
        setEmail(''); setUsername(''); setPassword(''); setPasswordConfirm('');
      } else {
        setError(data.message || 'Kayıt başarısız oldu.');
      }
    } catch (error) {
      console.error('Ağ Hatası:', error);
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    const loginData = { email: email, password: password };
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.access_token && data.username) { 
          login(data); 
          navigate('/home'); 
        } else {
          setError('Giriş başarılı ancak oturum bilgileri eksik alındı.');
        }
      } else {
        setError(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Ağ Hatası:', error);
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Giriş başarılı:", user);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/homepage"); // buraya yönlendiriyoruz
  } catch (error) {
    console.error("Giriş hatası:", error.message);
  }
};


  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setError(''); setEmail(''); setUsername(''); setPassword(''); setPasswordConfirm(''); setRememberMe(false);
  };

  // --- Şifremi Unuttum Fonksiyonları ---
  const openForgotPasswordModal = (e) => {
    e.preventDefault(); // Linkin varsayılan davranışını engelle
    setIsForgotPasswordModalOpen(true);
    setForgotPasswordEmail(''); // Modalı her açtığında inputu temizle
    setForgotPasswordMessage('');
    setForgotPasswordError('');
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setForgotPasswordError('');
    setIsSubmittingForgotPassword(true);

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Lütfen e-posta adresinizi girin.');
      setIsSubmittingForgotPassword(false);
      return;
    }

    try {
      // Backend'e istek gönderilecek (yeni endpoint /api/forgot-password)
      const response = await fetch('http://127.0.0.1:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage(data.message || "Şifre sıfırlama talimatları için e-postanızı kontrol edin (eğer kayıtlıysanız).");
        // İsteğe bağlı: Başarılı olunca modalı kapatabilir veya bir süre sonra kapatabilirsiniz.
        // setTimeout(closeForgotPasswordModal, 3000); 
      } else {
        setForgotPasswordError(data.message || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      }
    } catch (error) {
      console.error('Şifremi Unuttum Ağ Hatası:', error);
      setForgotPasswordError('Sunucuya bağlanırken bir hata oluştu.');
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };
  // --- Bitiş: Şifremi Unuttum Fonksiyonları ---

  return (
    <div className="auth-page-split">
      <div className="auth-welcome-panel">
          <div className="welcome-content">
             <h1 className="welcome-title">Tekrar hoş geldiniz!</h1>
             <p className="welcome-subtitle">Uygun alışverişin adresi...</p>
             <img src={illustrationImage} alt="Mağaza İllüstrasyonu" className="welcome-illustration" />
           </div>
      </div>

      <div className="auth-form-panel">
         <div className="auth-form-content">
            <h2 className="auth-form-title">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
            <p className="auth-form-subtitle">
                {isLogin ? 'Lütfen aşağıdaki bilgileri doldurun' : 'Hesap oluşturmak için bilgileri doldurun'}
            </p>
            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="auth-form">
                {!isLogin && (
                   <div className="form-group">
                     <label htmlFor="username">Ad Soyad</label>
                     <input type="text" id="username" name="username" value={username} onChange={handleInputChange} required />
                   </div>
                 )}
                 <div className="form-group">
                   <label htmlFor="email">E-POSTA</label>
                   <input type="email" id="email" name="email" value={email} onChange={handleInputChange} required />
                 </div>
                 <div className="form-group">
                   <label htmlFor="password">ŞİFRE</label>
                   <input type="password" id="password" name="password" value={password} onChange={handleInputChange} required />
                 </div>
                 {!isLogin && (
                    <div className="form-group">
                     <label htmlFor="passwordConfirm">ŞİFREYİ ONAYLA</label>
                     <input type="password" id="passwordConfirm" name="passwordConfirm" value={passwordConfirm} onChange={handleInputChange} required />
                   </div>
                 )}
                 {isLogin && (
                   <div className="remember-forgot-group">
                     <div className="remember-me">
                       <input type="checkbox" id="rememberMe" name="rememberMe" checked={rememberMe} onChange={handleInputChange} />
                       <label htmlFor="rememberMe">Beni Hatırla</label>
                     </div>
                     {/* Şifremi Unuttum linki modalı açacak */}
                     <a href="#" className="forgot-password-link" onClick={openForgotPasswordModal}>Şifremi Unuttum?</a>
                   </div>
                 )}
                 {error && <p className="error-message">{error}</p>}
                 <button type="submit" className="submit-button" disabled={isSubmittingForgotPassword}>
                   {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                 </button>
            </form>
             <div className="social-separator"><span>VEYA</span></div>
             <div className="social-login">
                <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                   <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                   Google ile Devam Et
                </button>
             </div>
             {isLogin ? ( <p className="switch-mode alternate">Hesabınız yok mu?{' '}<span onClick={switchAuthMode} className="switch-mode-link">Kayıt Ol</span></p> ) 
                     : ( <p className="switch-mode">Zaten hesabınız var mı?{' '}<span onClick={switchAuthMode} className="switch-mode-link">Giriş Yap</span></p> )}
         </div>
      </div>

      {/* Şifremi Unuttum Modalı */}
      <Modal
        isOpen={isForgotPasswordModalOpen}
        onRequestClose={closeForgotPasswordModal}
        contentLabel="Şifremi Unuttum Modalı"
        className="auth-modal forgot-password-modal" // CSS için sınıf
        overlayClassName="auth-modal-overlay"
      >
        <h2>Şifremi Unuttum</h2>
        <p>Lütfen kayıtlı e-posta adresinizi girin. Şifre sıfırlama talimatları size gönderilecektir.</p>
        <form onSubmit={handleForgotPasswordSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="forgotPasswordEmail">E-posta Adresi</label>
            <input
              type="email"
              id="forgotPasswordEmail"
              name="forgotPasswordEmail"
              value={forgotPasswordEmail}
              onChange={handleInputChange}
              required
              className="modal-input"
            />
          </div>
          {forgotPasswordMessage && <p className="success-message">{forgotPasswordMessage}</p>}
          {forgotPasswordError && <p className="error-message">{forgotPasswordError}</p>}
          <div className="modal-actions">
            <button type="submit" className="submit-button modal-submit-button" disabled={isSubmittingForgotPassword}>
              {isSubmittingForgotPassword ? 'Gönderiliyor...' : 'Gönder'}
            </button>
            <button type="button" className="cancel-button modal-cancel-button" onClick={closeForgotPasswordModal}>
              İptal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AuthPage;
