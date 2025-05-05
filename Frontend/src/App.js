import React, { useState } from 'react';
// Component importları
import HomePage from './pages/homepage';
import ProductList from './components/ProductList'; // Eğer HomePage içinde kullanılmıyorsa
// import ShoppingCart from './components/ShoppingCart'; // TopBar içinde kullanılıyor
// import NearestMarket from './components/NearestMarket'; // Kullanılıyorsa import kalsın
import TopBar from './components/TopBar';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage'; // Sepet sayfası importu
// Rotalama importları
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// Context importu
import { AuthProvider } from './context/AuthContext';
// CSS importu
import './App.css';

function App() {
  // --- State Tanımlamaları ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Sepet dropdown'ı için
  const [activeCategory, setActiveCategory] = useState('Atıştırmalık');
  const [cartIconPosition, setCartIconPosition] = useState(null);
  // Arama terimi state'i
  const [searchTerm, setSearchTerm] = useState('');
  

  // --- Sepet Fonksiyonları ---
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
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
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

  // --- Kategori ve Sepet Açma/Kapama ---
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Bu fonksiyonun kullanımı devam ediyorsa kalabilir
  const getCartPosition = () => {
    return cartIconPosition;
  };

  // Arama terimini güncelleyen fonksiyon
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // --- Toplam Tutar ---
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    // AuthProvider ile uygulamayı sarmala
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* TopBar'a Gerekli Tüm Propları Gönder */}
          <TopBar
            cartCount={cartItems.length}
            onCartClick={toggleCart}
            setCartIconPosition={setCartIconPosition}
            isCartOpen={isCartOpen}
            cartItems={cartItems}
            totalAmount={totalAmount}
            onRemoveFromCart={handleRemoveFromCart}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onCloseCart={toggleCart}
            // Arama ile ilgili proplar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          {/* ProductList burada render ediliyorsa kalsın, yoksa kaldırılabilir */}
          {/* <ProductList onAddToCart={handleAddToCart} /> */}

          <div className="content-wrapper">
            <Routes>
              {/* Giriş/Kayıt Sayfası */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Ana Sayfa */}
              <Route path="/home" element={
                <HomePage
                  onAddToCart={handleAddToCart} // Ürün ekleme fonksiyonu
                  activeCategory={activeCategory}
                  onCategorySelect={handleCategorySelect}
                  getCartPosition={getCartPosition} // Gerekli mi kontrol et
                  searchTerm={searchTerm} // Arama terimi prop'u
                />}
              />

              {/* Tam Ekran Sepet Sayfası - ESLint Hatası Düzeltildi */}
              <Route
                  path="/cart"
                  // ----> DÜZELTME BURADA: element prop'u geçerli JSX içermeli <----
                  element={
                      <CartPage
                          cartItems={cartItems}
                          totalAmount={totalAmount}
                          onRemoveFromCart={handleRemoveFromCart}
                          onIncreaseQuantity={handleIncreaseQuantity}
                          onDecreaseQuantity={handleDecreaseQuantity}
                      />
                  }
                  // ----> DÜZELTME SONU <----
              />

              {/* Kök dizine gelince /auth'a yönlendir */}
              <Route path="/" element={<Navigate to="/auth" />} />

              {/* Diğer sayfalarınız için routelar buraya eklenebilir */}
            </Routes>

          </div>
          <footer>
            <p>&copy; 2025 Shop-GO</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;