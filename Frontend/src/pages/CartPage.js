// src/pages/CartPage.js - Market Bulma Eklendi, Tasarıma Uyarlandı

import React, { useState } from 'react'; // useState gerekli
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa'; 
import './CartPage.css'; // CSS dosyasını import ediyoruz

// App.js'ten gelen proplar
function CartPage({ 
    cartItems, 
    totalAmount, // Genel toplam tutarı alıyoruz
    onRemoveFromCart, 
    onIncreaseQuantity, 
    onDecreaseQuantity 
}) {
  const navigate = useNavigate();
  // Market önerileri için state'ler
  const [marketSuggestions, setMarketSuggestions] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState('');

  // En uygun marketi bulma fonksiyonu
  const handleFindNearestMarket = async () => {
    if (cartItems.length === 0) {
        setMarketError("Öneri için sepette ürün olmalı.");
        return;
    }    
    setIsLoadingMarkets(true);
    setMarketError('');
    setMarketSuggestions([]); 
    const productNames = cartItems.map(item => item.name);
    const params = new URLSearchParams();
    productNames.forEach(name => params.append('product', name));
    // Backend adresinizin doğru olduğundan emin olun
    const url = `http://localhost:5000/api/markets-with-products/filter?${params.toString()}`; 

    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
        const data = await response.json(); 
        const marketTotals = {}; 
        const marketProductPrices = {}; 
        
        // Backend yanıtını işleme (önceki gibi)
        data.forEach(marketData => {
            if (!marketProductPrices[marketData.market]) {
                marketProductPrices[marketData.market] = { address: marketData.adres };
            }
            Object.entries(marketData.urunler).forEach(([productName, priceStr]) => {
                 const priceMatch = priceStr.match(/([\d,.]+)/);
                 const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null;
                 if (price !== null) {
                     marketProductPrices[marketData.market][productName.toLowerCase()] = price;
                 }
            });
        });

       Object.entries(marketProductPrices).forEach(([marketName, products]) => {
           let currentMarketTotal = 0;
           let missingItemsCount = 0;
           cartItems.forEach(cartItem => {
               const priceInMarket = products[cartItem.name.toLowerCase()];
               if (priceInMarket !== undefined) {
                   currentMarketTotal += priceInMarket * cartItem.quantity;
               } else {
                   missingItemsCount++;
               }
           });
           marketTotals[marketName] = {
               total: currentMarketTotal,
               missingCount: missingItemsCount, 
               address: products.address 
            };
       });

       const sortedSuggestions = Object.entries(marketTotals)
           .map(([name, data]) => ({ 
               name, 
               totalPrice: data.total.toFixed(2), 
               address: data.address,
               missingCount: data.missingCount 
            }))
           .sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice)); // Sayısal sıralama

        setMarketSuggestions(sortedSuggestions);
        if (sortedSuggestions.length === 0) {
             setMarketError("Sepetinizdeki tüm ürünleri içeren market bulunamadı veya API yanıt vermedi.");
        }

    } catch (error) {
        console.error("Market önerileri alınırken hata oluştu:", error);
        setMarketError("Market önerileri alınamadı. Lütfen tekrar deneyin.");
    } finally {
        setIsLoadingMarkets(false);
    }
  };

  // Siparişi tamamlama (placeholder)
   const handleCheckout = () => {
      alert('Sipariş Tamamlama işlemi henüz tanımlanmadı!');
      // navigate('/checkout'); 
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
        // Sepet doluysa gösterilecek içerik
        <> {/* Fragment ile gruplama */}
            {/* İki Sütunlu İçerik Alanı */}
            <div className="cart-page-content">
              {/* Sol Sütun: Ürün Listesi */}
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
                             <button onClick={() => onDecreaseQuantity(item.id)} disabled={item.quantity <= 1} aria-label={`${item.name} adetini azalt`}><FaMinus size={10}/></button>
                             <span className="item-quantity">{item.quantity}</span>
                             <button onClick={() => onIncreaseQuantity(item.id)} aria-label={`${item.name} adetini artır`}><FaPlus size={10}/></button>
                          </div>
                          <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.id)} aria-label={`${item.name} ürününü sil`}><FaTrashAlt /></button>
                       </div>
                       <div className="cart-page-item-line-total">
                          {(item.price * item.quantity).toFixed(2)} ₺
                       </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sağ Sütun: Sipariş Özeti */}
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
                  <button className="checkout-button" onClick={handleCheckout}>
                      Siparişi Tamamla
                  </button>
                </div>
              </div>
            </div> {/* cart-page-content div'i burada bitiyor */}

            {/* Market Öneri Bölümü - İki Sütunun DIŞINDA, Fragment içinde */}
            <div className="market-suggestion-section">
                <button 
                    className="find-market-button" 
                    onClick={handleFindNearestMarket}
                    disabled={isLoadingMarkets || cartItems.length === 0} 
                >
                    {isLoadingMarkets ? 'Marketler Aranıyor...' : 'En Uygun Marketi Bul'}
                </button>

                {marketError && <p className="market-error">{marketError}</p>}

                {marketSuggestions.length > 0 && (
                <div className="market-suggestions">
                    <h3>Market Fiyat Önerileri (Sepet Toplamı):</h3>
                    <ul>
                    {marketSuggestions.map((market, index) => (
                        <li key={index}>
                            <div> {/* Market adı ve adresi için bir grup */}
                                <strong>{market.name}</strong> 
                                {market.address && <small style={{ marginLeft: '5px', color: '#666'}}>({market.address})</small>}
                            </div>
                            <div> {/* Fiyat ve eksik ürün bilgisi için bir grup */}
                                <span>Toplam: {market.totalPrice} ₺</span>
                                {market.missingCount > 0 && <small style={{color: 'orange', marginLeft: '10px'}}>({market.missingCount} ürün eksik)</small>}
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
                )}
            </div>
        </> // Fragment burada bitiyor
      )}
    </div>
  );
}

export default CartPage;
