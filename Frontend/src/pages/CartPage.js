// src/pages/CartPage.js
import { useContext, useEffect, useState } from 'react'; // Debug için useEffect eklendi
import { LocationContext } from '../context/LocationContext';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate şu anda kullanılmıyor, gerekmiyorsa kaldırılabilir.
import { FaTrashAlt, FaPlus, FaMinus, FaStore } from 'react-icons/fa';
import './CartPage.css';

function CartPage({
  cartItems,
  totalAmount,
  onRemoveFromCart,
  onIncreaseQuantity,
  onDecreaseQuantity
}) {
  const { selectedLocation } = useContext(LocationContext);
  const navigate = useNavigate(); // Kullanılmıyorsa bu satır da kaldırılabilir.
  const [marketSuggestions, setMarketSuggestions] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState('');

  // DEBUG: State değişikliklerini izlemek için geçici useEffect
  useEffect(() => {
    console.log("%cSTATE DEBUG:%c isLoadingMarkets:", "color:blue; font-weight:bold;", "color:blue;", isLoadingMarkets, "| marketError:", marketError, "| marketSuggestions:", marketSuggestions);
  }, [isLoadingMarkets, marketError, marketSuggestions]);


  const fetchNearestMarkets = async (lat, lon) => {
    console.log(`%cfetchNearestMarkets ÇAĞRILDI%c - Enlem: ${lat}, Boylam: ${lon}`, "color:green; font-weight:bold;", "color:green;"); // KONTROL 1
    try {
      setIsLoadingMarkets(true);
      setMarketError('');
      setMarketSuggestions([]); // Her yeni arama öncesi eski sonuçları temizle
      console.log("fetchNearestMarkets: State'ler sıfırlandı, API isteği yapılıyor..."); // KONTROL 2
      const response = await fetch(`http://127.0.0.1:5000/api/nearest-markets?latitude=${lat}&longitude=${lon}`);
      console.log("fetchNearestMarkets: API yanıt durumu:", response.status, response.statusText); // KONTROL 3
      if (!response.ok) {
        const errorText = await response.text(); // Sunucudan gelen hata mesajını almaya çalışalım
        console.error("fetchNearestMarkets: API yanıtı BAŞARISIZ! Detay:", errorText); // KONTROL 4
        throw new Error(`Marketler getirilemedi (HTTP ${response.status})`);
      }
      const result = await response.json();
      console.log("fetchNearestMarkets: API sonucu (raw):", result); // KONTROL 5 (Gelen veriyi gör)

      // API'den gelen result'ın bir dizi olup olmadığını kontrol edelim
      if (!Array.isArray(result)) {
          console.error("fetchNearestMarkets: API'den beklenen formatta (dizi) veri gelmedi!", result);
          throw new Error("API'den geçersiz veri formatı alındı.");
      }

      if (result.length === 0) {
        console.log("fetchNearestMarkets: Sonuç boş, market bulunamadı."); // KONTROL 6
        setMarketError("Seçili konum için yakın market bulunamadı.");
        setMarketSuggestions([]); // Emin olmak için tekrar boşaltalım
      } else {
        console.log("fetchNearestMarkets: Marketler bulundu, state güncelleniyor. Bulunan market sayısı:", result.length); // KONTROL 7
        setMarketSuggestions(result.slice(0, 5));
      }
    } catch (err) {
      console.error("%cfetchNearestMarkets CATCH HATASI:%c", "color:red; font-weight:bold;", "color:red;", err); // KONTROL 8
      setMarketError(err.message || "❌ Market verileri alınamadı.");
      setMarketSuggestions([]); // Hata durumunda da listeyi boşalt
    } finally {
      setIsLoadingMarkets(false);
      console.log("fetchNearestMarkets: FINALLY bloğu çalıştı, isLoadingMarkets: false"); // KONTROL 9
    }
  };

  // Otomatik market getirmeyi sağlayan useEffect kaldırılmıştı.

  const handleCheckout = async () => {
    console.log("%chandleCheckout ÇAĞRILDI%c", "color:orange; font-weight:bold;", "color:orange;"); // KONTROL A
    console.log("handleCheckout - selectedLocation:", selectedLocation); // KONTROL B

    if (!selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number') {
      console.warn("handleCheckout: Geçersiz selectedLocation! Konum seçilmemiş veya format hatalı."); // KONTROL C
      setMarketError("Lütfen haritadan bir teslimat adresi seçin.");
      // alert("En yakın marketleri görebilmek için lütfen öncelikle haritadan bir teslimat adresi seçin."); // Buton zaten disabled olacak
      return;
    }
    console.log("handleCheckout: selectedLocation geçerli, fetchNearestMarkets çağrılacak."); // KONTROL D
    await fetchNearestMarkets(selectedLocation.latitude, selectedLocation.longitude);
    console.log("handleCheckout: fetchNearestMarkets çağrısı tamamlandı."); // KONTROL E
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
              {/* ... (sepet ürünleri listesi) ... */}
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
                <button
                  className="checkout-button"
                  onClick={handleCheckout}
                  disabled={isLoadingMarkets || !selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number'}
                  title={(!selectedLocation || typeof selectedLocation.latitude !== 'number' || typeof selectedLocation.longitude !== 'number') ? "Lütfen önce haritadan bir konum seçin" : "Siparişi Tamamla ve Marketleri Gör"}
                >
                  {isLoadingMarkets ? 'Marketler Aranıyor...' : 'Siparişi Tamamla ve En Yakın 5 Marketi Göster'}
                </button>
              </div>
            </div>
          </div>

          {/* Marketler Yükleniyor Mesajı */}
          {isLoadingMarkets && <p style={{textAlign: 'center', margin: '20px 0', fontWeight:'bold'}}>Marketler yükleniyor...</p>}
          
          {/* Market Listesi */}
          {!isLoadingMarkets && !marketError && marketSuggestions.length > 0 && (
            <div className="market-list-section">
              <h2>En Yakın Marketler</h2>
              <div className="market-cards-area">
                {marketSuggestions.map((marketData, index) => (
                  <div key={index} className="market-card-item">
                    <div className="market-card-details">
                      <FaStore className="market-icon" />
                      <span className="market-card-name">
                        {marketData.market && marketData.market.name ? marketData.market.name : 'Market Adı Yok'}
                      </span>
                    </div>
                    <div className="market-card-distance-badge">
                      <span>{marketData.distance !== undefined ? `${marketData.distance} km` : '? km'}</span>
                    </div>
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