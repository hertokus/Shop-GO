// src/pages/CartPage.js
import { useContext, useEffect, useState } from 'react';
import { LocationContext } from '../context/LocationContext';
import { Link } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaMinus, FaStore, FaDirections } from 'react-icons/fa'; // FaDirections eklendi
import './CartPage.css';

function CartPage({
  cartItems, // Artık fiyatsız ürünleri içeren alışveriş listesi
  onRemoveFromCart,
  onIncreaseQuantity,
  onDecreaseQuantity
  // totalAmount prop'u artık App.js'ten gelmiyor ve burada kullanılmıyor.
}) {
  const { selectedLocation } = useContext(LocationContext);
  // navigate kullanılmıyorsa kaldırılabilir.
  // const navigate = useNavigate(); 

  // State adını marketPriceSuggestions olarak değiştirdik, çünkü artık fiyat bilgisi de içeriyor.
  const [marketPriceSuggestions, setMarketPriceSuggestions] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState('');

  // DEBUG: State değişikliklerini izlemek için
  useEffect(() => {
    console.log("%cCartPage STATE DEBUG:%c isLoadingMarkets:", "color:purple; font-weight:bold;", "color:purple;", isLoadingMarkets, "| marketError:", marketError, "| marketPriceSuggestions:", marketPriceSuggestions);
  }, [isLoadingMarkets, marketError, marketPriceSuggestions]);

  // Eski fetchNearestMarkets fonksiyonu yerine bu fonksiyon kullanılacak.
  const fetchMarketPricesForList = async () => {
    // Gerekli kontroller
    if (!selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number') {
      setMarketError("Lütfen haritadan bir teslimat adresi seçin.");
      setMarketPriceSuggestions([]); // Hata durumunda veya konum yoksa eski önerileri temizle
      return;
    }
    if (cartItems.length === 0) {
        setMarketError("Alışveriş listenizde hiç ürün yok. Lütfen önce ürün ekleyin.");
        setMarketPriceSuggestions([]);
        return;
    }

    console.log(`%cfetchMarketPricesForList ÇAĞRILDI%c - Konum:`, "color:green; font-weight:bold;", "color:green;", selectedLocation);
    setIsLoadingMarkets(true);
    setMarketError('');
    setMarketPriceSuggestions([]); // Yeni arama öncesi eski sonuçları temizle

    // Alışveriş listesini backend'in beklediği formata dönüştür
    const shoppingListPayload = cartItems.map(item => ({
      productId: item.productId, // App.js'te productId olarak sakladığımızı varsayıyoruz
      quantity: item.quantity
    }));

    console.log("fetchMarketPricesForList: Backend'e gönderilecek payload:", {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        shopping_list: shoppingListPayload
    });

    try {
      // YENİ API ENDPOINT'İNE İSTEK
      const response = await fetch(`http://127.0.0.1:5000/api/calculate-list-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          shopping_list: shoppingListPayload
        })
      });
      console.log("fetchMarketPricesForList: API yanıt durumu:", response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Market fiyatları alınamadı (HTTP ${response.status})` }));
        console.error("fetchMarketPricesForList: API yanıtı BAŞARISIZ! Detay:", errorData);
        throw new Error(errorData.message || `Market fiyatları alınamadı (HTTP ${response.status})`);
      }
      const results = await response.json(); // Bu yanıt market adı, mesafe, toplam liste fiyatı, enlem, boylam içermeli
      console.log("fetchMarketPricesForList: API sonucu (raw):", results);

      if (!Array.isArray(results)) {
        console.error("fetchMarketPricesForList: API'den beklenen formatta (dizi) veri gelmedi!", results);
        throw new Error("API'den geçersiz veri formatı alındı.");
      }

      if (results.length === 0) {
        console.log("fetchMarketPricesForList: Sonuç boş, market bulunamadı veya fiyat hesaplanamadı.");
        setMarketError("Seçili konum için market bulunamadı veya listenizdeki ürünler için fiyat hesaplanamadı.");
        setMarketPriceSuggestions([]);
      } else {
        console.log("fetchMarketPricesForList: Market fiyatları bulundu, state güncelleniyor. Sonuç sayısı:", results.length);
        setMarketPriceSuggestions(results); // Gelen sonuçları state'e ata
      }
    } catch (err) {
      console.error("%cfetchMarketPricesForList CATCH HATASI:%c", "color:red; font-weight:bold;", "color:red;", err);
      setMarketError(err.message || "❌ Market fiyatları alınamadı.");
      setMarketPriceSuggestions([]);
    } finally {
      setIsLoadingMarkets(false);
      console.log("fetchMarketPricesForList: FINALLY bloğu çalıştı, isLoadingMarkets: false");
    }
  };

  // handleCheckout fonksiyonu fetchMarketPricesForList'i çağıracak şekilde güncellendi/yeniden adlandırıldı
  const handleShowMarketPrices = async () => {
    console.log("%chandleShowMarketPrices ÇAĞRILDI%c", "color:orange; font-weight:bold;", "color:orange;");
    await fetchMarketPricesForList(); // Yeni fonksiyonu çağır
    console.log("handleShowMarketPrices: fetchMarketPricesForList çağrısı tamamlandı.");
  };

  // Google Haritalar'da yol tarifi açan fonksiyon
  const handleGetDirections = (latitude, longitude) => {
    if (latitude && longitude) {
      // Kullanıcının mevcut konumunu da ekleyerek direkt yol tarifi açmak için:
      // const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=$${latitude},${longitude}`;
      // Sadece hedefi göstermek için:
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank'); // Yeni sekmede açar
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
                  // App.js'te listeye eklerken productId kullandığımızı varsayıyoruz
                  <li key={item.productId} className="cart-page-item">
                    {/* Ürün görseli isteğe bağlı olarak eklenebilir, şimdilik kaldırıldı */}
                    <div className="cart-page-item-details">
                      <span className="item-name">{item.name}</span>
                      {/* Bireysel fiyat gösterimi kaldırıldı */}
                    </div>
                    <div className="cart-page-item-controls">
                      <div className="item-quantity-adjuster">
                        <button onClick={() => onDecreaseQuantity(item.productId)} disabled={item.quantity <= 1}><FaMinus size={10}/></button>
                        <span className="item-quantity">{item.quantity}</span>
                        <button onClick={() => onIncreaseQuantity(item.productId)}><FaPlus size={10}/></button>
                      </div>
                      <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.productId)}><FaTrashAlt /></button>
                    </div>
                    {/* Satır toplamı gösterimi kaldırıldı */}
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
                {/* Eski totalAmount gösterimi kaldırıldı */}
                <button
                  className="checkout-button" // CSS sınıf adı kalabilir veya "show-market-prices-button" gibi değiştirilebilir
                  onClick={handleShowMarketPrices} // Güncellenmiş fonksiyonu çağırır
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

          {/* Marketler Yükleniyor Mesajı */}
          {isLoadingMarkets && <p style={{textAlign: 'center', margin: '20px 0', fontWeight:'bold'}}>Market fiyatları hesaplanıyor...</p>}
          
          {/* Market Fiyat Karşılaştırma Bölümü */}
          {!isLoadingMarkets && !marketError && marketPriceSuggestions.length > 0 && (
            <div className="market-list-section">
              <h2>Market Fiyat Karşılaştırması</h2>
              <div className="market-cards-area">
                {marketPriceSuggestions.map((suggestion, index) => (
                  // suggestion objesi: market_id, market_name, distance, latitude, longitude, total_list_price, currency, unavailable_items_count
                  <div key={suggestion.market_id || index} className="market-card-item suggestion-card">
                    <div className="market-card-main-info"> {/* Ana bilgileri gruplamak için */}
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
                            Bu markette listenizdeki {suggestion.unavailable_items_count} ürün bulunmuyor.
                            {/* İsteğe bağlı: Bulunamayan ürünleri listelemek için
                            {suggestion.unavailable_item_details && suggestion.unavailable_item_details.length > 0 && (
                                <ul className="unavailable-list">
                                    {suggestion.unavailable_item_details.map(un_item => (
                                        <li key={un_item.productId}>{un_item.name}</li>
                                    ))}
                                </ul>
                            )}
                            */}
                        </div>
                    )}
                    {/* Yol Tarifi Butonu */}
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
          
          {/* Hata Mesajı */}
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
