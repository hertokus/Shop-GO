import React, { useState, useRef, useEffect } from 'react';
import './TopBar.css';
import { FaShoppingCart, FaUserCircle, FaMapMarkerAlt, FaSearch, FaHome } from 'react-icons/fa';
import logo from '../assets/CHART.png';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useLocation import edildi
import { useAuth } from '../context/AuthContext';
import ShoppingCart from './ShoppingCart';

// Harita ve Modal için importlar
import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// LocationPicker Component'i
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  return null;
}

function TopBar({
    cartCount,
    onCartClick,
    isCartOpen,
    cartItems,
    totalAmount,
    onRemoveFromCart,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onCloseCart,
    searchTerm,
    onSearchChange,
    selectedAddressText,
    isAddressModalOpen,
    toggleAddressModal,
    onLocationSelectForModal,
    initialMapCoords
}) {
  const cartIconRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation(); // Mevcut sayfa yolunu almak için

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogoutClick = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/auth');
  };

  const defaultMapCenter = initialMapCoords ? [initialMapCoords.lat, initialMapCoords.lng] : [37.00, 35.325];

  // Giriş Yap / Kayıt Ol linkinin gösterilip gösterilmeyeceğine karar ver
  const showAuthLink = !isAuthenticated && location.pathname !== '/auth';

  return (
    <div className="top-bar">
      {/* Sol Taraf - Logo ve Uygulama Adı */}
      <div className="top-bar-left-logo">
        <Link to={isAuthenticated ? "/home" : "/auth"} className="logo-link">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <span className="app-name">Shop&GO</span>
          </div>
        </Link>
      </div>

      {/* Orta Kısım - Yeni Birleşik Arama/Konum Barı */}
      {isAuthenticated && (
        <div className="search-location-bar">
          <div className="search-input-container">
            <FaSearch className="search-icon-inside" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={onSearchChange}
              className="search-input-field"
            />
          </div>
          <div className="location-display-container" onClick={toggleAddressModal}>
            <FaHome className="location-icon-inside" />
            <span className="location-text-inside">
              {selectedAddressText || "Konum Seç"}
            </span>
          </div>
        </div>
      )}

      {/* Sağ Taraf - Profil, Sepet */}
      <div className="top-bar-right">
        {isAuthenticated && user ? (
          <div className="profile-section" ref={profileDropdownRef}>
            <button className="profile-button" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
              <FaUserCircle size={28} />
            </button>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">Merhaba, {user.fullName || user.username}!</div>
                <ul>
                  <li><button onClick={handleLogoutClick} className="logout-dropdown-button">Çıkış Yap</button></li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          // ---- YENİ KOŞUL BURADA ----
          showAuthLink && (
            <Link to="/auth" className="auth-link">Giriş Yap / Kayıt Ol</Link>
          )
          // ---- YENİ KOŞUL SONU ----
        )}

        {isAuthenticated && (
          <div id="cart-icon" className="cart" onClick={onCartClick} ref={cartIconRef}>
            <FaShoppingCart size={24} />
            {cartCount > 0 && (<span className="cart-count">{cartCount}</span>)}
          </div>
        )}
        {isAuthenticated && ( <ShoppingCart isOpen={isCartOpen} cartItems={cartItems} totalAmount={totalAmount} onRemoveFromCart={onRemoveFromCart} onIncreaseQuantity={onIncreaseQuantity} onDecreaseQuantity={onDecreaseQuantity} onCloseCart={onCloseCart} /> )}
      </div>

      {/* Konum Seçme Modalı */}
      {isAuthenticated && (
        <Modal
          isOpen={isAddressModalOpen}
          onRequestClose={toggleAddressModal}
          className="map-modal"
          overlayClassName="map-overlay"
          contentLabel="Konum Seçme Haritası"
          ariaHideApp={false}
        >
          <h2>Haritadan Konum Seçin</h2>
          <MapContainer
            center={defaultMapCenter}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
            whenCreated={ mapInstance => {
                setTimeout(() => { mapInstance.invalidateSize() }, 100);
              }
            }
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onLocationSelect={onLocationSelectForModal} />
            {initialMapCoords && (
              <Marker position={[initialMapCoords.lat, initialMapCoords.lng]} />
            )}
          </MapContainer>
          <button className="modal-close-button" onClick={toggleAddressModal}>Kapat</button>
        </Modal>
      )}
    </div>
  );
}

export default TopBar;
