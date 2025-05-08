// src/components/TopBar.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import './TopBar.css';
import { FaShoppingCart, FaUserCircle, FaSearch, FaHome } from 'react-icons/fa';
import logo from '../assets/CHART.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShoppingCart from './ShoppingCart';
import { LocationContext } from '../context/LocationContext';

import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  const { setSelectedLocation } = useContext(LocationContext);
  
  const handleMapClick = ({ lat, lng }) => {
    if (setSelectedLocation) {
        setSelectedLocation({ latitude: lat, longitude: lng });
    }
    onLocationSelectForModal({ lat, lng });
  };
  
  const cartIconRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth(); // user objesi { username, fullName } içeriyor
  const location = useLocation();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) &&
          cartIconRef.current && !cartIconRef.current.contains(event.target) 
      ) {
        if (event.target.closest && !event.target.closest('#cart-icon')) {
           setIsProfileDropdownOpen(false);
        }
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
  const showAuthLink = !isAuthenticated && location.pathname !== '/auth';

  const handleDropdownLinkClick = () => {
    setIsProfileDropdownOpen(false); 
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left-logo">
        <Link to={isAuthenticated ? "/home" : "/auth"} className="logo-link">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <span className="app-name">Shop&GO</span>
          </div>
        </Link>
      </div>

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

      <div className="top-bar-right">
        {isAuthenticated && user ? (
          <div className="profile-section" ref={profileDropdownRef}>
            <button className="profile-button" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
              <FaUserCircle size={28} />
            </button>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">Merhaba, {user.fullName || user.username}!</div>
                <ul className="dropdown-menu-list">
                  {/* YENİ: Ad Soyad Bilgisi Bölümü */}
                  <li className="dropdown-section">
                    <div className="dropdown-section-title">Hesap Sahibi</div>
                    <div className="dropdown-user-info-text">
                      {user.fullName || user.username || "Bilgi Yok"}
                    </div>
                  </li>
                  <li className="dropdown-divider"></li>
                  {/* // YENİ BÖLÜM SONU */}
                  <li className="dropdown-section">
                    <div className="dropdown-section-title">Adresim</div>
                    <div className="dropdown-address-text">
                      {selectedAddressText || "Henüz bir adres seçmediniz."}
                    </div>
                  </li>
                  <li className="dropdown-divider"></li>
                  <li className="dropdown-section">
                    <div className="dropdown-section-title">İndirim Kuponlarım</div>
                    <div 
                      className="dropdown-menu-item dropdown-link"
                      onClick={handleDropdownLinkClick} 
                      style={{ cursor: 'pointer' }} 
                    >
                      Kuponlarımı Gör
                    </div>
                  </li>
                  <li className="dropdown-divider"></li>
                  <li>
                    <button onClick={handleLogoutClick} className="dropdown-menu-item logout-dropdown-button">
                      Çıkış Yap
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          showAuthLink && (
            <Link to="/auth" className="auth-link">Giriş Yap / Kayıt Ol</Link>
          )
        )}

        {isAuthenticated && (
          <div id="cart-icon" className="cart" onClick={onCartClick} ref={cartIconRef}>
            <FaShoppingCart size={24} />
            {cartCount > 0 && (<span className="cart-count">{cartCount}</span>)}
          </div>
        )}
        {isAuthenticated && ( <ShoppingCart isOpen={isCartOpen} cartItems={cartItems} totalAmount={totalAmount} onRemoveFromCart={onRemoveFromCart} onIncreaseQuantity={onIncreaseQuantity} onDecreaseQuantity={onDecreaseQuantity} onCloseCart={onCloseCart} /> )}
      </div>

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
            whenCreated={(mapInstance) => {
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onLocationSelect={handleMapClick} />
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