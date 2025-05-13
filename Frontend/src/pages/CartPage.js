// src/pages/CartPage.js
import { useContext, useEffect, useState } from 'react';
import { LocationContext } from '../context/LocationContext';
import { Link } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaMinus, FaStore, FaDirections } from 'react-icons/fa';
import './CartPage.css';

function CartPage({
  cartItems,
  onRemoveFromCart,
  onIncreaseQuantity,
  onDecreaseQuantity
}) {
  const { selectedLocation } = useContext(LocationContext);
  const [marketPriceSuggestions, setMarketPriceSuggestions] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState('');

  useEffect(() => {
    // console.log("%cCartPage STATE DEBUG:%c isLoadingMarkets:", "color:purple; font-weight:bold;", "color:purple;", isLoadingMarkets, "| marketError:", marketError, "| marketPriceSuggestions:", marketPriceSuggestions);
  }, [isLoadingMarkets, marketError, marketPriceSuggestions]);

  const fetchMarketPricesForList = async () => {
    if (!selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number') {
      setMarketError("Lütfen haritadan bir teslimat adresi seçin.");
      setMarketPriceSuggestions([]);
      return;
    }
    if (cartItems.length === 0) {
        setMarketError("Alışveriş listenizde hiç ürün yok. Lütfen önce ürün ekleyin.");
        setMarketPriceSuggestions([]);
        return;
    }
    setIsLoadingMarkets(true);
    setMarketError('');
    setMarketPriceSuggestions([]);
    const shoppingListPayload = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/calculate-list-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          shopping_list: shoppingListPayload
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Market fiyatları alınamadı (HTTP ${response.status})` }));
        throw new Error(errorData.message || `Market fiyatları alınamadı (HTTP ${response.status})`);
      }
      const results = await response.json();
      if (!Array.isArray(results)) throw new Error("API'den geçersiz veri formatı alındı.");
      if (results.length === 0) {
        setMarketError("Seçili konum için market bulunamadı veya listenizdeki ürünler için fiyat hesaplanamadı.");
      }
      setMarketPriceSuggestions(results);
    } catch (err) {
      setMarketError(err.message || "❌ Market fiyatları alınamadı.");
    } finally {
      setIsLoadingMarkets(false);
    }
  };

  const handleShowMarketPrices = async () => {
    await fetchMarketPricesForList();
  };

  const handleGetDirections = (latitude, longitude) => {
    if (latitude && longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    } else {
      alert("Marketin konum bilgisi bulunamadı.");
      console.warn("Yol tarifi için marketin enlem/boylam bilgisi eksik.");
    }
  };

  return (
    <div className="cart-page-container">
      <h1>Alışveriş Listem</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart-message">
          <p>Alışveriş listeniz boş.</p>
          <Link to="/home">Alışverişe Başla</Link>
        </div>
      ) : (
        <>
          <div className="cart-page-content">
            <div className="cart-items-column">
              <h2>Listedeki Ürünler</h2>
              <ul className="cart-page-item-list">
                {cartItems.map((item) => (
                  <li key={item.productId} className="cart-page-item">
                    {/* YENİ: Ürün Görseli */}
                    <div className="cart-item-image-container">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-placeholder">Resim Yok</div>
                      )}
                    </div>
                    {/* YENİ SONU */}
                    <div className="cart-page-item-details">
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="cart-page-item-controls">
                      <div className="item-quantity-adjuster">
                        <button onClick={() => onDecreaseQuantity(item.productId)} disabled={item.quantity <= 1}><FaMinus size={10}/></button>
                        <span className="item-quantity">{item.quantity}</span>
                        <button onClick={() => onIncreaseQuantity(item.productId)}><FaPlus size={10}/></button>
                      </div>
                      <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.productId)}><FaTrashAlt /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cart-summary-column">
              <div className="cart-summary">
                <h2>Liste Özeti</h2>
                <div className="summary-row">
                  <span>Toplam Ürün Çeşidi:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="summary-row">
                  <span>Toplam Ürün Adedi:</span>
                  <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
                <button
                  className="checkout-button"
                  onClick={handleShowMarketPrices}
                  disabled={isLoadingMarkets || !selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number' || cartItems.length === 0}
                  title={
                    !selectedLocation ? "Lütfen önce haritadan bir konum seçin" :
                    cartItems.length === 0 ? "Listeye ürün ekleyin" :
                    "En Yakın Marketleri ve Liste Fiyatlarını Göster"
                  }
                >
                  {isLoadingMarkets ? 'Fiyatlar Hesaplanıyor...' : 'Market Fiyatlarını Göster'}
                </button>
              </div>
            </div>
          </div>

          {isLoadingMarkets && <p style={{textAlign: 'center', margin: '20px 0', fontWeight:'bold'}}>Market fiyatları hesaplanıyor...</p>}
          
          {!isLoadingMarkets && !marketError && marketPriceSuggestions.length > 0 && (
            <div className="market-list-section">
              <h2>Market Fiyat Karşılaştırması</h2>
              <div className="market-cards-area">
                {marketPriceSuggestions.map((suggestion, index) => (
                  <div key={suggestion.market_id || index} className="market-card-item suggestion-card">
                    <div className="market-card-main-info">
                        <div className="market-card-details">
                          <FaStore className="market-icon" />
                          <span className="market-card-name">{suggestion.market_name || 'Bilinmeyen Market'}</span>
                        </div>
                        <div className="market-price-info">
                            <span className="market-list-total-price">
                                Liste Toplamı: {suggestion.total_list_price !== undefined ? suggestion.total_list_price.toFixed(2) : 'N/A'} {suggestion.currency || '₺'}
                            </span>
                            <span className="market-card-distance-badge">
                                {suggestion.distance !== undefined ? `${suggestion.distance.toFixed(1)} km` : '? km'}
                            </span>
                        </div>
                    </div>
                    {suggestion.unavailable_items_count > 0 && (
                        <div className="unavailable-items-warning">
                            Bu markette listenizdeki {suggestion.unavailable_items_count} ürün bulunmuyor:
                            {suggestion.unavailable_item_details && suggestion.unavailable_item_details.length > 0 && (
                                <ul className="unavailable-list-details">
                                    {suggestion.unavailable_item_details.map(unavailableItem => (
                                        <li key={unavailableItem.productId || unavailableItem.name}>
                                            {unavailableItem.name || `ID: ${unavailableItem.productId}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    <button 
                      className="get-directions-button"
                      onClick={() => handleGetDirections(suggestion.latitude, suggestion.longitude)}
                      disabled={!suggestion.latitude || !suggestion.longitude}
                      title={(!suggestion.latitude || !suggestion.longitude) ? "Bu market için konum bilgisi yok" : `${suggestion.market_name} için yol tarifi al`}
                    >
                      <FaDirections /> Yol Tarifi Al
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isLoadingMarkets && marketError && (
            <div className="market-error">
              {marketError}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
