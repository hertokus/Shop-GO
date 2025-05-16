// src/App.js

import React, { useState, useEffect, useContext } from 'react';
// Component importları
import HomePage from './pages/homepage';
import TopBar from './components/TopBar';
import CategoryBar from './components/CategoryBar';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import AccountSettingsPage from './pages/AccountSettingsPage'; // YENİ: Hesap Ayarları sayfası import edildi
import { LocationProvider, LocationContext } from './context/LocationContext'; 
// Rotalama importları
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
// Context importu
import { AuthProvider, useAuth } from './context/AuthContext';
// CSS importu
import './App.css';

const categories = [
  { id: 1, name: 'Atıştırmalık', displayName: 'Atıştırmalık' },
  { id: 2, name: 'İçecek', displayName: 'İçecek' },
  { id: 3, name: 'Meyve & Sebze', displayName: 'Meyve & Sebze' },
  { id: 4, name: 'Süt Ürünleri', displayName: 'Süt Ürünleri' },
  { id: 5, name: 'Kahvaltılık', displayName: 'Kahvaltılık' },
  { id: 6, name: 'Temel Gıda', displayName: 'Temel Gıda' },
  { id: 7, name: 'Şarküteri', displayName: 'Şarküteri' },
  { id: 8, name: 'Dondurulmuş', displayName: 'Dondurulmuş Gıda' },
  { id: 9, name: 'Temizlik', displayName: 'Temizlik Ürünleri' },
  { id: 10, name: 'Ev & Yaşam', displayName: 'Ev & Yaşam' },
];

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const { selectedLocation: contextSelectedLocation, setSelectedLocation: updateLocationInContext } = useContext(LocationContext);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('shopGoShoppingList'); 
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart;
        }
      }
    } catch (error) {
      console.error("AppContent: localStorage'dan alışveriş listesi yüklenirken hata oluştu:", error);
      localStorage.removeItem('shopGoShoppingList');
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || 'Atıştırmalık');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddressText, setSelectedAddressText] = useState("Konum Seçin");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('shopGoShoppingList', JSON.stringify(cartItems));
    } catch (error) {
      console.error("AppContent: Alışveriş Listesi localStorage'a kaydedilirken hata oluştu:", error);
    }
  }, [cartItems]);

  useEffect(() => {
    const savedAddressText = localStorage.getItem('selectedUserAddressText');
    if (savedAddressText) {
      setSelectedAddressText(savedAddressText);
    }

    const savedCoordsString = localStorage.getItem('selectedUserCoords');
    if (savedCoordsString) {
      try {
        const parsedCoords = JSON.parse(savedCoordsString); 
        if (parsedCoords && typeof parsedCoords.lat === 'number' && typeof parsedCoords.lng === 'number') {
          if (updateLocationInContext) {
            console.log("AppContent (useEffect on mount): LocationContext localStorage'dan güncelleniyor - ", { latitude: parsedCoords.lat, longitude: parsedCoords.lng });
            updateLocationInContext({ latitude: parsedCoords.lat, longitude: parsedCoords.lng });
          }
        }
      } catch (e) {
        console.error("localStorage'dan koordinat parse hatası:", e);
        localStorage.removeItem('selectedUserCoords'); 
      }
    }
  }, [updateLocationInContext]); 


  const handleLocationSelectedFromMap = async (latlng) => { 
    setIsAddressModalOpen(false); 
    setSelectedAddressText("Adres yükleniyor..."); 

    const newLocationForContext = { latitude: latlng.lat, longitude: latlng.lng };
    const newLocationForStorage = { lat: latlng.lat, lng: latlng.lng }; 
    
    if (updateLocationInContext) {
      console.log("AppContent (handleLocationSelectedFromMap): LocationContext güncelleniyor - ", newLocationForContext);
      updateLocationInContext(newLocationForContext); 
    }
    localStorage.setItem('selectedUserCoords', JSON.stringify(newLocationForStorage)); 

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=tr`
      );
      if (!response.ok) throw new Error(`Nominatim API hatası: ${response.status}`);
      const data = await response.json();
      const address = data.address;
      const parts = [address.road, address.house_number, address.neighbourhood || address.suburb, address.city_district, address.city || address.town || address.village];
      const filteredParts = parts.filter(Boolean);
      const fullAddress = filteredParts.length > 0 ? filteredParts.join(", ") : data.display_name || "Adres detayı bulunamadı";
      setSelectedAddressText(fullAddress);
      localStorage.setItem('selectedUserAddressText', fullAddress);
    } catch (err) {
      console.error("Adres alınamadı:", err);
      setSelectedAddressText("Adres bulunamadı");
      localStorage.removeItem('selectedUserAddressText'); 
    }
  };
  
  useEffect(() => {
    if (contextSelectedLocation && contextSelectedLocation.latitude && contextSelectedLocation.longitude) {
      const savedAddressText = localStorage.getItem('selectedUserAddressText');
      if (selectedAddressText === "Konum Seçin" && savedAddressText) {
          setSelectedAddressText(savedAddressText);
      }
    } else {
      const savedAddressText = localStorage.getItem('selectedUserAddressText');
      if (!savedAddressText) {
          setSelectedAddressText("Konum Seçin");
      }
    }
  }, [contextSelectedLocation, selectedAddressText]);


  const handleAddToCart = (product) => {
    if (!product || typeof product.id === 'undefined' || product.id === null) {
        console.error("[DEBUG App.js handleAddToCart] Gelen Ürün objesi tanımsız, 'id' alanı yok veya 'id' null!", product);
        alert("Ürün listeye eklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
        return; 
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find((item) => item.productId === product.id); 
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, {
        productId: product.id, 
        name: product.name,
        category: product.category, 
        unit: product.unit,         
        image_url: product.image_url, 
        quantity: 1
      }];
    });
  };
  const handleRemoveFromCart = (productId) => setCartItems(prevItems => prevItems.filter((item) => item.productId !== productId));
  const handleIncreaseQuantity = (productId) => setCartItems(prevItems => prevItems.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
  const handleDecreaseQuantity = (productId) => setCartItems(prevItems => prevItems.map(item => item.productId === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
  const handleLogoutAndClearCart = () => { logout(); setCartItems([]); };
  const handleCategorySelect = (categoryName) => setActiveCategory(categoryName);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const toggleAddressModal = () => setIsAddressModalOpen(!isAddressModalOpen);

  return (
    <div className="app-container">
      <TopBar
        cartCount={cartItems.length}
        onCartClick={toggleCart}
        isCartOpen={isCartOpen}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onIncreaseQuantity={handleIncreaseQuantity}
        onDecreaseQuantity={handleDecreaseQuantity}
        onCloseCart={toggleCart}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedAddressText={selectedAddressText} 
        isAddressModalOpen={isAddressModalOpen}
        toggleAddressModal={toggleAddressModal}
        onLocationSelectForModal={handleLocationSelectedFromMap} 
        initialMapCoords={contextSelectedLocation ? { lat: contextSelectedLocation.latitude, lng: contextSelectedLocation.longitude } : null}
      />

      {isAuthenticated && location.pathname !== '/cart' && (
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      )}

      <div className="content-wrapper">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/home" 
            element={
              isAuthenticated ? (
                <HomePage
                  onAddToCart={handleAddToCart}
                  activeCategory={activeCategory}
                  searchTerm={searchTerm}
                />
              ) : (
                <Navigate to="/auth" replace /> 
              )
            } 
          />
          <Route
            path="/cart"
            element={
              isAuthenticated ? (
                <CartPage
                  cartItems={cartItems}
                  onRemoveFromCart={handleRemoveFromCart}
                  onIncreaseQuantity={handleIncreaseQuantity}
                  onDecreaseQuantity={handleDecreaseQuantity}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          {/* YENİ: Hesap Ayarları Sayfası için Route */}
          <Route
            path="/hesap-ayarlari"
            element={
              isAuthenticated ? (
                <AccountSettingsPage />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
      <footer>
        <p>&copy; {new Date().getFullYear()} Shop-GO</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LocationProvider> 
      <AuthProvider>
        <Router>
          <AppContent /> 
        </Router>
      </AuthProvider>
    </LocationProvider>
  );
}

export default App;