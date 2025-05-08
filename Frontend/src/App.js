// src/App.js

import React, { useState, useEffect } from 'react';
// Component importları
import HomePage from './pages/homepage';
import TopBar from './components/TopBar';
import CategoryBar from './components/CategoryBar';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import { LocationProvider } from './context/LocationContext';
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
  const { isAuthenticated, user, logout } = useAuth(); // AuthContext'ten user ve logout'u da alıyoruz
  const location = useLocation();

  // Sepet state'ini localStorage'dan okuyarak başlatma
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('shopGoCartItems');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          console.log("AppContent: Sepet localStorage'dan yüklendi.", parsedCart);
          return parsedCart;
        }
      }
    } catch (error) {
      console.error("AppContent: localStorage'dan sepet yüklenirken hata oluştu:", error);
      localStorage.removeItem('shopGoCartItems'); // Hatalı veriyi temizle
    }
    console.log("AppContent: localStorage'da sepet bulunamadı veya hatalı, boş sepetle başlanıyor.");
    return [];
  });

  // Diğer state'ler
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || 'Atıştırmalık');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddressText, setSelectedAddressText] = useState("Konum Seçin");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // cartItems her değiştiğinde localStorage'a kaydetme
  useEffect(() => {
    try {
      console.log("AppContent: Sepet localStorage'a kaydediliyor...", cartItems);
      localStorage.setItem('shopGoCartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("AppContent: Sepet localStorage'a kaydedilirken hata oluştu:", error);
    }
  }, [cartItems]);

  // Konum bilgilerini localStorage'dan yükleme (bu zaten vardı)
  useEffect(() => {
    const savedAddressText = localStorage.getItem('selectedUserAddressText');
    const savedCoordsString = localStorage.getItem('selectedUserCoords');
    if (savedAddressText) setSelectedAddressText(savedAddressText);
    if (savedCoordsString) {
      try {
        setSelectedLocationCoords(JSON.parse(savedCoordsString));
      } catch (e) {
        console.error("localStorage'dan koordinat parse hatası:", e);
        localStorage.removeItem('selectedUserCoords');
      }
    }
  }, []); // Bu useEffect sadece bileşen ilk yüklendiğinde çalışır

  // Sepet işlemleri fonksiyonları (setCartItems'ı fonksiyonel güncelleme ile kullanacak şekilde güncellendi)
  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter((item) => item.id !== productId));
  };

  const handleIncreaseQuantity = (productId) => {
    setCartItems(prevItems => prevItems.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQuantity = (productId) => {
    setCartItems(prevItems => prevItems.map((item) =>
      item.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  // Çıkış yapıldığında sepeti de temizlemek için (TopBar'a prop olarak geçilebilir)
  const handleLogoutAndClearCart = () => {
    logout(); // AuthContext'ten gelen logout
    setCartItems([]); // Sepeti boşaltır (bu useEffect ile localStorage'ı da günceller)
    // localStorage.removeItem('shopGoCartItems'); // Doğrudan da silinebilir, ama setCartItems([]) yeterli olmalı.
    // Yönlendirme zaten TopBar içinde navigate('/auth') ile yapılıyor.
  };


  // Diğer handle fonksiyonları
  const handleCategorySelect = (categoryName) => setActiveCategory(categoryName);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const toggleAddressModal = () => setIsAddressModalOpen(!isAddressModalOpen);

  const handleLocationSelectedFromMap = async (latlng) => {
    setSelectedLocationCoords(latlng);
    setIsAddressModalOpen(false);
    setSelectedAddressText("Adres yükleniyor...");
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
      localStorage.setItem('selectedUserCoords', JSON.stringify(latlng));
    } catch (err) {
      console.error("Adres alınamadı:", err);
      setSelectedAddressText("Adres bulunamadı");
      localStorage.removeItem('selectedUserAddressText');
      localStorage.removeItem('selectedUserCoords');
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="app-container">
      <TopBar
        cartCount={cartItems.length}
        onCartClick={toggleCart}
        isCartOpen={isCartOpen}
        cartItems={cartItems}
        totalAmount={totalAmount}
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
        initialMapCoords={selectedLocationCoords}
        // onLogout={handleLogoutAndClearCart} // Eğer TopBar'daki logout butonu sepeti de temizleyecekse bu prop'u kullanın.
                                               // TopBar.js içinde logout yerine onLogout çağrılmalı.
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
          <Route path="/home" element={
            <HomePage
              onAddToCart={handleAddToCart}
              activeCategory={activeCategory}
              searchTerm={searchTerm}
            />}
          />
          <Route
            path="/cart"
            element={ <CartPage cartItems={cartItems} totalAmount={totalAmount} onRemoveFromCart={handleRemoveFromCart} onIncreaseQuantity={handleIncreaseQuantity} onDecreaseQuantity={handleDecreaseQuantity} /> }
          />
          <Route path="/" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
      <footer>
        <p>&copy; {new Date().getFullYear()} Shop-GO</p>
      </footer>
    </div>
  );
}

// Ana App component'i (değişiklik yok)
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