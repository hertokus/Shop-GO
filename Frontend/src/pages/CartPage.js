// src/pages/CartPage.js - Dinamik Market Önerisi Eklendi (Kullanıcı Konumu Alarak ve Sepet Altına Yazdırma)
import { useContext, useEffect } from 'react';
import { LocationContext } from '../context/LocationContext';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';
import './CartPage.css';

function CartPage({
 cartItems,
 totalAmount,
 onRemoveFromCart,
 onIncreaseQuantity,
 onDecreaseQuantity
}) {
  const { selectedLocation } = useContext(LocationContext);
 const navigate = useNavigate();
 const [marketSuggestions, setMarketSuggestions] = useState([]);
 const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
 const [marketError, setMarketError] = useState('');

 const fetchNearestMarkets = async (lat, lon) => {
  try {
    setIsLoadingMarkets(true);
    setMarketError('');
    const response = await fetch(`http://127.0.0.1:5000/api/nearest-markets?latitude=${lat}&longitude=${lon}`);
    if (!response.ok) throw new Error("API yanıtı alınamadı.");
    const result = await response.json();
    setMarketSuggestions(result.slice(0, 5));
  } catch (err) {
    console.error(err);
    setMarketError("❌ Market verileri alınamadı.");
  } finally {
    setIsLoadingMarkets(false);
  }
};




 useEffect(() => {
  if (selectedLocation) {
    fetchNearestMarkets(selectedLocation.latitude, selectedLocation.longitude);
  }
}, [selectedLocation]);

 const handleCheckout = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum desteği sunmuyor.");
      return;
    }
  
    setIsLoadingMarkets(true);
    setMarketError('');
    setMarketSuggestions([]);
  
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
    
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/nearest-markets?latitude=${lat}&longitude=${lon}`);
        if (!response.ok) throw new Error("API yanıtı alınamadı.");
    
        const result = await response.json();
        const sliced = result.slice(0, 5); // En yakın 5 market
        setMarketSuggestions(sliced);
      } catch (err) {
        console.error(err);
        setMarketError("❌ Market verileri alınamadı.");
      } finally {
        setIsLoadingMarkets(false);
      }
    }, (error) => {
      console.error("Konum hatası:", error);
      setIsLoadingMarkets(false);
      setMarketError("Konum alınamadı. Lütfen konum izni verin.");
    });
    
  };
  

 return (
  <div className="cart-page-container">
   <h1>Sepetim</h1>
   {cartItems.length === 0 ? (
    <div className="empty-cart-message">
     <p>Sepetiniz boş.</p>
     <Link to="/home">Alışverişe Başla</Link>
    </div>
   ) : (
    <>
     <div className="cart-page-content">
      <div className="cart-items-column">
       <ul className="cart-page-item-list">
        {cartItems.map((item) => (
         <li key={item.id} className="cart-page-item">
          <div className="cart-page-item-details">
           <span className="item-name">{item.name}</span>
           <span className="item-unit-price">{item.price.toFixed(2)} ₺</span>
          </div>
          <div className="cart-page-item-controls">
           <div className="item-quantity-adjuster">
            <button onClick={() => onDecreaseQuantity(item.id)} disabled={item.quantity <= 1}><FaMinus size={10}/></button>
            <span className="item-quantity">{item.quantity}</span>
            <button onClick={() => onIncreaseQuantity(item.id)}><FaPlus size={10}/></button>
           </div>
           <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.id)}><FaTrashAlt /></button>
          </div>
          <div className="cart-page-item-line-total">
           {(item.price * item.quantity).toFixed(2)} ₺
          </div>
         </li>
        ))}
       </ul>
      </div>

      <div className="cart-summary-column">
       <div className="cart-summary">
        <h2>Sipariş Özeti</h2>
        <div className="summary-row">
         <span>Ara Toplam:</span>
         <span>{totalAmount} ₺</span>
        </div>
        <div className="summary-row total-row">
         <span>Genel Toplam:</span>
         <span>{totalAmount} ₺</span>
        </div>
        <button className="checkout-button" onClick={handleCheckout} disabled={isLoadingMarkets}>
         {isLoadingMarkets ? 'Marketler Aranıyor...' : 'Siparişi Tamamla ve En Yakın 5 Marketi Göster'}
        </button>
       </div>
      </div>
     </div>
     {/* En Yakın Marketler Listesi */}
{marketSuggestions.length > 0 && (
  <div className="market-suggestions-container">
    <h2>En Yakın Marketler</h2>
    <ul>
      {marketSuggestions.map((market, index) => (
        <li key={index}>
          <strong>{market.market.name}</strong> - {market.distance} km
        </li>
      ))}
    </ul>
  </div>
)}

{marketError && (
  <div style={{ color: 'red', marginTop: '1rem' }}>
    {marketError}
  </div>
)}



     {/* En Yakın Marketler Listesi */}
     
     
    </>
   )}
  </div>
 );
}

export default CartPage;
