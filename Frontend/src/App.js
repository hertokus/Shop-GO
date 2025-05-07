import React, { useState, useEffect } from 'react';
// Component importları
import HomePage from './pages/homepage';
import TopBar from './components/TopBar';
import CategoryBar from './components/CategoryBar';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import { LocationProvider } from './context/LocationContext';
// Rotalama importları
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// Context importu
import { AuthProvider, useAuth } from './context/AuthContext'; // useAuth import edildi
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

// AppContent adında yeni bir component oluşturuyoruz, çünkü hook'lar (useAuth gibi)
// sadece React fonksiyon componentlerinin içinde veya custom hook'ların içinde çağrılabilir.
// AuthProvider'ın altındaki bir component'te useAuth kullanmalıyız.
function AppContent() {
  const { isAuthenticated } = useAuth(); // Kimlik doğrulama durumu alındı

  // --- State Tanımlamaları ---
  // Bu state'ler ve fonksiyonlar AppContent içine taşındı
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || 'Atıştırmalık');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddressText, setSelectedAddressText] = useState("Konum Seçin");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    const savedAddressText = localStorage.getItem('selectedUserAddressText');
    const savedCoordsString = localStorage.getItem('selectedUserCoords');
    if (savedAddressText) setSelectedAddressText(savedAddressText);
    if (savedCoordsString) {
      try { setSelectedLocationCoords(JSON.parse(savedCoordsString)); }
      catch (e) {
        console.error("localStorage'dan koordinat parse hatası:", e);
        localStorage.removeItem('selectedUserCoords');
      }
    }
  }, []);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };
  const handleIncreaseQuantity = (productId) => {
    setCartItems(cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };
  const handleDecreaseQuantity = (productId) => {
    setCartItems(cartItems.map((item) =>
      item.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
  };
  const toggleCart = () => { setIsCartOpen(!isCartOpen); };
  const handleSearchChange = (event) => { setSearchTerm(event.target.value); };
  const toggleAddressModal = () => { setIsAddressModalOpen(!isAddressModalOpen); };

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
      />
      {/* ---- YENİ: CategoryBar sadece isAuthenticated true ise render edilecek ---- */}
      {isAuthenticated && (
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      )}
      {/* ---- YENİ SONU ---- */}

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

// Ana App component'i artık AuthProvider'ı ve AppContent'i sarıyor.
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
