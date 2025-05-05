import React, { useRef, useEffect } from 'react';
import './TopBar.css';
import { FaShoppingCart } from 'react-icons/fa';
import logo from '../assets/CHART.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShoppingCart from './ShoppingCart';

// Arama için searchTerm ve onSearchChange props'ları eklendi
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
    onCloseCart,
    searchTerm,       // Yeni prop
    onSearchChange    // Yeni prop
}) {
  const cartIconRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Bu log, isAuthenticated'in TopBar'a nasıl geldiğini görmek için önemli
  console.log('TopBar - isAuthenticated değeri:', isAuthenticated);

  useEffect(() => {
    // Sepet ikonu pozisyonu için kod (değişmedi)
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

      {/* Orta Kısım - Arama Çubuğu */}
      {isAuthenticated && ( // Sadece giriş yapıldıysa göster
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}        // Değeri state'e bağla
            onChange={onSearchChange}   // Değişikliği App.js'e ilet
          />
        </div>
      )}

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
            <Link to="/auth" className="auth-link">Giriş Yap / Kayıt Ol</Link>
          )}
        </div>

        {/* Sepet İkonu Alanı */}
        {isAuthenticated && ( // Sadece giriş yapıldıysa göster
          <div id="cart-icon" className="cart" onClick={onCartClick} ref={cartIconRef}>
            <FaShoppingCart size={24} />
            {cartCount > 0 && (<span className="cart-count">{cartCount}</span>)}
          </div>
        )}

        {/* Sepetin Gösterildiği Yer (Dropdown) */}
        {isAuthenticated && ( // Sadece giriş yapıldıysa göster
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