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
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('shopGoShoppingList'); 
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          console.log("AppContent: Alışveriş Listesi localStorage'dan yüklendi.", parsedCart);
          return parsedCart;
        }
      }
    } catch (error) {
      console.error("AppContent: localStorage'dan alışveriş listesi yüklenirken hata oluştu:", error);
      localStorage.removeItem('shopGoShoppingList');
    }
    console.log("AppContent: localStorage'da liste bulunamadı/hatalı, boş listeyle başlanıyor.");
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || 'Atıştırmalık');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddressText, setSelectedAddressText] = useState("Konum Seçin");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    try {
      console.log("AppContent: Alışveriş Listesi localStorage'a kaydediliyor...", cartItems);
      localStorage.setItem('shopGoShoppingList', JSON.stringify(cartItems));
    } catch (error) {
      console.error("AppContent: Alışveriş Listesi localStorage'a kaydedilirken hata oluştu:", error);
    }
  }, [cartItems]);

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
  }, []);

  const handleAddToCart = (product) => {
    // DEBUG: handleAddToCart'a gelen product objesini ve ID'sini logla
    console.log("%c[DEBUG App.js handleAddToCart]%c Gelen Ürün:", "color:teal; font-weight:bold;", "color:teal;", product);
    if (product && typeof product.id !== 'undefined') {
        console.log("%c[DEBUG App.js handleAddToCart]%c Gelen Ürün ID:", "color:teal; font-weight:bold;", "color:teal;", product.id);
    } else {
        console.warn("%c[DEBUG App.js handleAddToCart]%c Gelen Ürün objesi tanımsız veya 'id' alanı yok!", "color:red; font-weight:bold;", "color:red;", product);
        // Eğer product.id tanımsızsa, burada bir işlem yapmadan çıkmak veya hata vermek isteyebilirsiniz.
        // Şimdilik devam etmesine izin veriyoruz, backend logları productId='None' olarak gösterecektir.
    }

    setCartItems(prevItems => {
      // product.id'nin geçerli bir değer olduğunu ve backend'deki product ID ile eşleştiğini varsayıyoruz.
      const existingItem = prevItems.find((item) => item.productId === product.id); 
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, {
        productId: product.id, // Burası çok önemli! product.id tanımsızsa, buraya da tanımsız geçer.
        name: product.name,
        category: product.category, 
        unit: product.unit,         
        image_url: product.image_url, 
        quantity: 1
      }];
    });
    console.log("Listeye Eklendi (App.js):", product.name, "ile productId:", product.id);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter((item) => item.productId !== productId));
  };

  const handleIncreaseQuantity = (productId) => {
    setCartItems(prevItems => prevItems.map((item) =>
      item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQuantity = (productId) => {
    setCartItems(prevItems => prevItems.map((item) =>
      item.productId === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleLogoutAndClearCart = () => {
    logout();
    setCartItems([]);
  };

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
        initialMapCoords={selectedLocationCoords}
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
            element={
              <CartPage
                cartItems={cartItems}
                onRemoveFromCart={handleRemoveFromCart}
                onIncreaseQuantity={handleIncreaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
              />
            }
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
