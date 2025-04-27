import React, { useState } from 'react';
import './ShoppingCart.css';
import { AiOutlineClose } from 'react-icons/ai'; // Çarpı ikonu import edin

function ShoppingCart({ cartItems, onRemoveFromCart, onIncreaseQuantity, onDecreaseQuantity, onCloseCart }) {
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  const [marketSuggestions, setMarketSuggestions] = useState([]);

  const handleFindNearestMarket = () => {
    // Backend olmadan örnek market verileri oluşturalım
    const sampleMarkets = [
      { name: 'Yerel Market A', distance: '1.5 km', totalPrice: (parseFloat(totalAmount) * 1.05).toFixed(2) }, // Örnek fiyat artışı
      { name: 'Süpermarket B', distance: '2.1 km', totalPrice: totalAmount },
      { name: 'Ekonomik Market C', distance: '0.8 km', totalPrice: (parseFloat(totalAmount) * 0.98).toFixed(2) }, // Örnek fiyat düşüşü
    ];
    setMarketSuggestions(sampleMarkets);
  };

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h2>Sepetim</h2>
        <button className="close-button-cart" onClick={onCloseCart}>
          <AiOutlineClose size={20} />
        </button>
      </div>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Sepetiniz boş.</p>
        </div>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              <div className="item-info">
                <span>{item.name}</span>
                <span>{item.price} ₺</span>
              </div>
              <div className="quantity-controls">
                <button onClick={() => onDecreaseQuantity(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onIncreaseQuantity(item.id)}>+</button>
              </div>
              <button className="remove-button" onClick={() => onRemoveFromCart(item.id)}>Sil</button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <div className="total">
          <span>Toplam:</span>
          <span>{totalAmount} ₺</span>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="market-suggestion-section">
          <button className="find-market-button" onClick={handleFindNearestMarket}>En Uygun Marketi Bul</button>

          {marketSuggestions.length > 0 && (
            <div className="market-suggestions">
              <h3>Market Önerileri:</h3>
              <ul>
                {marketSuggestions.map((market, index) => (
                  <li key={index}>
                    <strong>{market.name}</strong> - Mesafe: {market.distance} - Tahmini Toplam: {market.totalPrice} ₺
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;