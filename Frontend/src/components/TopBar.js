import React, { useRef, useEffect } from 'react';
import './TopBar.css'; // TopBar için CSS dosyası
import { FaShoppingCart } from 'react-icons/fa';
import logo from '../assets/CHART.png'; // Logo importu (yolu doğrulayın)
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; // AuthContext hook'u
import ShoppingCart from './ShoppingCart'; // ShoppingCart bileşenini import et

// App.js'ten gelen tüm propları burada tanımla
function TopBar({ 
    cartCount, 
    onCartClick, // Sepet ikonuna tıklama işlevi (toggleCart)
    setCartIconPosition, 
    // ----- ShoppingCart için App.js'ten gelen yeni proplar -----
    isCartOpen, 
    cartItems, 
    totalAmount, 
    onRemoveFromCart, 
    onIncreaseQuantity, 
    onDecreaseQuantity, 
    onCloseCart // Sepeti kapatma işlevi (toggleCart)
}) {
  const cartIconRef = useRef(null);
  const navigate = useNavigate(); 

  const { isAuthenticated, user, logout } = useAuth(); 

  // Sepet ikonu pozisyonu için useEffect (aynı kalıyor)
  useEffect(() => {
    // Bu useEffect'in doğru çalışması için sepet ikonuna ID vermeniz 
    // VEYA ref'i daha farklı kullanmanız gerekebilir. Şimdilik bırakıyorum.
    if (cartIconRef.current && setCartIconPosition) {
      const rect = cartIconRef.current.getBoundingClientRect();
      setCartIconPosition({
         x: rect.left + rect.width / 2,
         y: rect.top + rect.height / 2,
      });
    }
  }, [setCartIconPosition, cartIconRef]); // ref'i dependency array'e eklemek iyi olabilir

  const handleLogout = () => {
    logout(); 
    navigate('/auth'); 
  };

  return (
    // TopBar'ın kendisine position: relative eklemek, 
    // içindeki absolute konumlandırılmış sepet için iyi olabilir (CSS'te)
    <div className="top-bar"> 
      {/* Sol Taraf - Logo */}
      <Link to={isAuthenticated ? "/home" : "/auth"} className="logo-link"> 
        <div className="logo-container"> 
          <img src={logo} alt="Logo" className="logo" />
          <span className="app-name">Shop&GO</span> 
        </div>
      </Link>

      {/* Orta Kısım - Arama Çubuğu */}
      <div className="search-bar">
        <input type="text" placeholder="Ürün ara..." />
      </div>

      {/* Sağ Taraf - Kullanıcı & Sepet */}
      <div className="top-bar-right"> 
        {/* Kullanıcı Bilgisi veya Giriş Linkleri */}
        <div className="user-auth-section">
          {isAuthenticated && user ? (
            <>
              <span className="welcome-user-message">Merhaba, {user?.username}!</span> 
              <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="auth-link">Giriş Yap / Kayıt Ol</Link>
            </>
          )}
        </div>

        {/* Sepet İkonu Alanı (position: relative eklemek iyi olabilir - CSS'te)*/}
        <div 
           id="cart-icon" 
           className="cart" 
           onClick={onCartClick} // App.js'teki toggleCart'ı çalıştırır
           ref={cartIconRef}
        > 
          <FaShoppingCart size={24} /> 
          {cartCount > 0 && (
             <span className="cart-count">{cartCount}</span>
          )}
        </div>

         {/* ----> SEPETİN GÖSTERİLDİĞİ YER <---- */}
         {/* isCartOpen true ise ShoppingCart'ı render et ve propları aktar */}
         {/* Bu eleman CSS'te absolute olarak konumlandırılacak */}
         <ShoppingCart 
            isOpen={isCartOpen}
            cartItems={cartItems}
            totalAmount={totalAmount}
            onRemoveFromCart={onRemoveFromCart}
            onIncreaseQuantity={onIncreaseQuantity}
            onDecreaseQuantity={onDecreaseQuantity}
            onCloseCart={onCloseCart} // Kapatma butonu için toggleCart'ı aktar
          />
         {/* ----> SEPETİN GÖSTERİLDİĞİ YER SONU <---- */}

      </div> 
    </div>
  );
}

export default TopBar;