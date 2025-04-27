import React, { useState } from 'react';
import HomePage from './pages/homepage';
import ShoppingCart from './components/ShoppingCart';
import NearestMarket from './components/NearestMarket';
import TopBar from './components/TopBar';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Atıştırmalık');
  const [cartIconPosition, setCartIconPosition] = useState(null);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    console.log(`${product.name} sepete eklendi! Mevcut sepet:`, cartItems);
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

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const getCartPosition = () => {
    return cartIconPosition;
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="app-container">
      <TopBar cartCount={cartItems.length} onCartClick={toggleCart} setCartIconPosition={setCartIconPosition} />
      <div className="content-wrapper">
        <HomePage
          onAddToCart={handleAddToCart}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          getCartPosition={getCartPosition}
        />
        {isCartOpen && (
          <div className="cart-modal-overlay">
            <ShoppingCart
              cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
              onCloseCart={toggleCart} // toggleCart fonksiyonunu onCloseCart prop'u olarak geçirin
            />
            {/* Kapat butonu artık ShoppingCart bileşeninde */}
          </div>
        )}
        {/* <NearestMarket totalAmount={totalAmount} /> */}
      </div>
      <footer>
        <p>&copy; 2025 Shop-GO</p>
      </footer>
    </div>
  );
}

export default App;