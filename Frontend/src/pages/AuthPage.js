import React, { useState, useContext } from 'react'; // useContext eklendi
import './AuthPage.css'; 
import { useNavigate } from 'react-router-dom';
// Context'i kullanmak için useAuth hook'unu import ediyoruz - YOLU KONTROL EDİN!
// Eğer context dosyanız src/context/AuthContext.js ise ve AuthPage src/pages/AuthPage.js ise bu yol doğrudur.
import { useAuth } from '../context/AuthContext'; 
import illustrationImage from './logo6.png'; 

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // AuthContext'ten login fonksiyonunu alıyoruz
  const { login } = useAuth(); 

  const handleInputChange = (e) => {
    // Bu fonksiyon aynı kalıyor
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') { setRememberMe(checked); }
    else if (name === 'email') { setEmail(value); }
    else if (name === 'username') { setUsername(value); }
    else if (name === 'password') { setPassword(value); }
    else if (name === 'passwordConfirm') { setPasswordConfirm(value); }
  };

  // KAYIT İŞLEMİ (Aynı kalabilir, context'i etkilemez)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    if (password !== passwordConfirm) { setError('Şifreler eşleşmiyor.'); return; }
    const userData = { username: username, email: email, password: password };

    try {
      const response = await fetch('http://localhost:5000/api/register', { 
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

  // GİRİŞ İŞLEMİ - Context Kullanacak Şekilde GÜNCELLENDİ
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    const loginData = { email: email, password: password };

    try {
      const response = await fetch('http://localhost:5000/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Giriş Başarılı (Backend Yanıtı):', data);
        // Backend'den token ve username geldiğini varsayıyoruz
        if (data.access_token && data.username) { 
          
          // ----> DEĞİŞİKLİK BURADA <----
          // localStorage'ı doğrudan set etmek yerine Context'teki login fonksiyonunu çağırıyoruz.
          // Bu fonksiyon hem state'i güncelleyecek hem de localStorage'a yazacak.
          login(data); 
          // ----> DEĞİŞİKLİK SONU <----
          
          console.log("Yönlendirme yapılıyor...");
          navigate('/home'); // Yönlendirme burada kalabilir veya Context'e taşınabilir
        } else {
          setError('Giriş başarılı ancak oturum bilgileri eksik alındı.');
          console.error("Eksik veri:", data); // Hata ayıklama için log
        }
      } else {
        setError(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Ağ Hatası:', error);
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  // Google Auth (placeholder)
  const handleGoogleAuth = () => {
    setError('');
    console.log('Google ile kimlik doğrulama başlatılıyor...');
    setError('Google ile giriş fonksiyonu henüz bağlı değil.'); 
  };

  // Mod değiştirme
  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
    setRememberMe(false);
  };

  return (
    <div className="auth-page-split">

      {/* Sol Panel */}
      <div className="auth-welcome-panel">
          <div className="welcome-content">
             <h1 className="welcome-title">Tekrar hoş geldiniz!</h1>
             <p className="welcome-subtitle">
                Uygun alışverişin adresi... 
             </p>
             <img 
                src={illustrationImage} 
                alt="Mağaza İllüstrasyonu" 
                className="welcome-illustration" 
             />
           </div>
      </div>

      {/* Sağ Panel */}
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
                     <a href="#" className="forgot-password-link">Şifremi Unuttum?</a>
                   </div>
                 )}
                 {error && <p className="error-message">{error}</p>}
                 <button type="submit" className="submit-button">
                   {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                 </button>
            </form>
             <div className="social-separator"><span>VEYA</span></div>
             <div className="social-login">
                <button type="button" className="google-btn" onClick={handleGoogleAuth}>
                   <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                   Google ile Devam Et
                </button>
             </div>
             {isLogin ? ( <p className="switch-mode alternate">Hesabınız yok mu?{' '}<span onClick={switchAuthMode} className="switch-mode-link">Kayıt Ol</span></p> ) 
                     : ( <p className="switch-mode">Zaten hesabınız var mı?{' '}<span onClick={switchAuthMode} className="switch-mode-link">Giriş Yap</span></p> )}
         </div>
      </div>

    </div>
  );
}

export default AuthPage;