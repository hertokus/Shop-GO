import React, { useState } from 'react';
// Component importları
import HomePage from './pages/homepage';
import ProductList from './components/ProductList';
import ShoppingCart from './components/ShoppingCart'; // Bu import artık gerekmeyebilir, çünkü App.js'de render edilmiyor.
import NearestMarket from './components/NearestMarket'; // Bu component kullanılıyor mu?
import TopBar from './components/TopBar';
import AuthPage from './pages/AuthPage'; 
import CartPage from './pages/CartPage'; // Yeni eklenen sepet sayfası importu
// Rotalama importları
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 
// Context importu - AuthContext.js dosyasının yolunu doğrulayın!
import { AuthProvider } from './context/AuthContext'; 
// CSS importu
import './App.css';

function App() {
  // --- State Tanımlamaları ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Sepet dropdown'ının açık/kapalı durumu
  const [activeCategory, setActiveCategory] = useState('Atıştırmalık'); // Aktif kategori
  const [cartIconPosition, setCartIconPosition] = useState(null); // Sepet ikonu pozisyonu (gerekliyse)
  
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

  // Sepet dropdown'ını açıp kapatan fonksiyon
  const toggleCart = () => { 
    setIsCartOpen(!isCartOpen);
  };

  // Bu fonksiyonun kullanımını kontrol edin, belki artık gerekli değildir
  const getCartPosition = () => {
    return cartIconPosition;
  };

  // --- Toplam Tutar ---
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    // AuthProvider ile uygulamayı sarmala
    <AuthProvider> 
      <Router>
        <div className="app-container">
          {/* TopBar'a Sepet Dropdown'ı için Gerekli Tüm Propları Gönder */}
          <TopBar 
            cartCount={cartItems.length} // Sepetteki ürün sayısı
            onCartClick={toggleCart} // İkona tıklanınca sepeti aç/kapat
            setCartIconPosition={setCartIconPosition} 
            // --- ShoppingCart (dropdown içindeki) için proplar ---
            isCartOpen={isCartOpen} 
            cartItems={cartItems} 
            totalAmount={totalAmount} 
            onRemoveFromCart={handleRemoveFromCart} 
            onIncreaseQuantity={handleIncreaseQuantity} 
            onDecreaseQuantity={handleDecreaseQuantity} 
            onCloseCart={toggleCart} // Dropdown içindeki kapatma butonu için
          />
          <ProductList onAddToCart={handleAddToCart} />
          <div className="content-wrapper">
            <Routes>
              {/* Giriş/Kayıt Sayfası */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Ana Sayfa */}
              <Route path="/home" element={<HomePage
                onAddToCart={handleAddToCart} // Ürün ekleme fonksiyonu
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
                getCartPosition={getCartPosition} // Gerekli mi?
              />} />
              
              {/* Tam Ekran Sepet Sayfası */}
              <Route 
                  path="/cart" 
                  element={
                      <CartPage 
                          cartItems={cartItems} 
                          totalAmount={totalAmount}
                          onRemoveFromCart={handleRemoveFromCart} 
                          onIncreaseQuantity={handleIncreaseQuantity} 
                          onDecreaseQuantity={handleDecreaseQuantity} 
                          // CartPage içinden sepete ürün ekleme olmayacağı için handleAddToCart burada yok
                      />
                  } 
              />
              
              {/* Kök dizine gelince /auth'a yönlendir (Veya giriş yapılmışsa /home'a yönlendirilebilir) */}
              <Route path="/" element={<Navigate to="/auth" />} /> 
              
              {/* Diğer sayfalarınız için routelar buraya eklenebilir */}
            </Routes>
            
            {/* Eski sepet modalı render edilmiyor */}

            {/* <NearestMarket totalAmount={totalAmount} /> */}
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