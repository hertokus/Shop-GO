import React, { useRef, useEffect } from 'react';
import './TopBar.css'; // TopBar için CSS dosyası
import { FaShoppingCart } from 'react-icons/fa';
import logo from '../assets/CHART.png'; // Logo importu (yolu doğrulayın)
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext hook'u
import ShoppingCart from './ShoppingCart'; // ShoppingCart bileşenini import et

function TopBar({
    cartCount,
    onCartClick,
    setCartIconPosition,
    isCartOpen,
    cartItems,
    totalAmount,
    onRemoveFromCart,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onCloseCart
}) {
  const cartIconRef = useRef(null);
  const navigate = useNavigate();

  const { isAuthenticated, user, logout } = useAuth();

  // ----> SORUNU ANLAMAK İÇİN BU LOG ÇOK ÖNEMLİ <----
  // Tarayıcı konsolunda bu çıktıyı kontrol et!
  console.log('TopBar - isAuthenticated değeri:', isAuthenticated);
  // ----> LOG SONU <----

  useEffect(() => {
    if (cartIconRef.current && setCartIconPosition) {
      const rect = cartIconRef.current.getBoundingClientRect();
      setCartIconPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [setCartIconPosition, cartIconRef]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="top-bar">
      {/* Sol Taraf - Logo */}
      <Link to={isAuthenticated ? "/home" : "/auth"} className="logo-link">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <span className="app-name">Shop&GO</span>
        </div>
      </Link>

      {/* Orta Kısım - Arama Çubuğu (Sadece isAuthenticated true ise gösterilir) */}
      {isAuthenticated && (
        <div className="search-bar">
          <input type="text" placeholder="Ürün ara..." />
        </div>
      )}

      {/* Sağ Taraf - Kullanıcı & Sepet */}
      <div className="top-bar-right">
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

        {/* Sepet İkonu Alanı (isAuthenticated kontrolü eklendi) */}
        {isAuthenticated && (
          <div
            id="cart-icon"
            className="cart"
            onClick={onCartClick}
            ref={cartIconRef}
          >
            <FaShoppingCart size={24} />
            {cartCount > 0 && (
               <span className="cart-count">{cartCount}</span>
            )}
          </div>
        )}

        {/* Sepetin Gösterildiği Yer (isAuthenticated kontrolü eklendi) */}
        {isAuthenticated && (
            <ShoppingCart
              isOpen={isCartOpen}
              cartItems={cartItems}
              totalAmount={totalAmount}
              onRemoveFromCart={onRemoveFromCart}
              onIncreaseQuantity={onIncreaseQuantity}
              onDecreaseQuantity={onDecreaseQuantity}
              onCloseCart={onCloseCart}
            />
        )}

      </div>
    </div>
  );
}

export default TopBar;