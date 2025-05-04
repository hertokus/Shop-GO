import React from 'react'; // useState'e gerek kalmadı
import './ShoppingCart.css'; // Güncellenmiş CSS dosyasını import ediyoruz
import { AiOutlineClose } from 'react-icons/ai'; 
// İkonları ekleyelim (react-icons kütüphanesini kurduğunuzu varsayıyorum: npm install react-icons)
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; // Sepete git butonu için
import { useState } from 'react';
// isOpen ve totalAmount prop'larını ekledik
function ShoppingCart({ 
  cartItems, 
  onRemoveFromCart, 
  onIncreaseQuantity, 
  onDecreaseQuantity, 
  onCloseCart,
  isOpen,
  totalAmount
}) {
  const navigate = useNavigate();

  const [nearestMarkets, setNearestMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [error, setError] = useState(null);

  const handleGoToCart = () => {
      onCloseCart(); // Sepet dropdown'ını kapat
      navigate('/cart'); // Tam sepet sayfasına yönlendir (bu route'u oluşturmanız gerekebilir)
  };

  const handleFindNearestMarkets = () => {
    setLoadingMarkets(true);
    setError(null);

    // Örnek koordinatları sabit verdik, istersen props veya navigator.geolocation ile dinamik yapabilirsin
    const latitude = 36.9618812;
    const longitude = 35.3103072;

    fetch(`http://127.0.0.1:5000/api/nearest-markets?latitude=${latitude}&longitude=${longitude}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Veri alınamadı");
        }
        return res.json();
      })
      .then(data => {
        setNearestMarkets(data);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingMarkets(false);
      });
  };


  return (
    // Ana kapsayıcıya dropdown ve open/close sınıflarını ekle
    <div className={`shopping-cart-dropdown ${isOpen ? 'open' : ''}`}> 
      {/* İçerik için sarmalayıcı */}
      <div className="cart-content"> 
        <div className="cart-header">
          <h2>Sepetim</h2>
          <button className="close-button-cart" onClick={onCloseCart}>
            <AiOutlineClose size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          // Sepet boş mesajı için yeni sınıf adı
          <div className="empty-cart-message"> 
            <p>Sepetiniz şu an boş.</p>
          </div>
        ) : (
          <> {/* Fragment kullanarak listeyi ve butonu grupla */}
            {/* Ürün listesi için yeni sınıf adı */}
            <ul className="cart-item-list"> 
              {cartItems.map((item) => (
                // Liste elemanı için yeni sınıf adı ve yapı
                <li key={item.id} className="cart-item"> 
                  {/* Sol taraf: İsim ve Fiyat */}
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price.toFixed(2)} ₺</span> 
                  </div>
                  {/* Sağ taraf: Kontroller */}
                  <div className="item-controls">
                     {/* Silme Butonu (İkon) */}
                     <button 
                        className="remove-item-btn" 
                        onClick={() => onRemoveFromCart(item.id)}
                        aria-label={`${item.name} ürününü sil`} // Erişilebilirlik için
                     >
                        <FaTrashAlt />
                     </button>
                     {/* Adet Ayarlayıcı */}
                     <div className="item-quantity-adjuster">
                        <button 
                           onClick={() => onDecreaseQuantity(item.id)} 
                           disabled={item.quantity <= 1} // Adet 1 ise eksi butonu pasif
                           aria-label={`${item.name} adetini azalt`}
                        >
                           <FaMinus size={10}/> {/* Daha küçük ikon */}
                        </button>
                        <span className="item-quantity">{item.quantity}</span>
                        <button 
                           onClick={() => onIncreaseQuantity(item.id)}
                           aria-label={`${item.name} adetini artır`}
                        >
                            <FaPlus size={10}/> {/* Daha küçük ikon */}
                        </button>
                     </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Sepete Git Butonu */}
            <button className="go-to-cart-button" onClick={handleGoToCart}>
                <span>Sepete Git</span>
                <span className="total-price">{totalAmount} ₺</span>
            </button>
                {/* Sepet dışında, sayfanın altında ayrı bir container */}
                {/* En Yakın Marketleri Bul Butonu */}
                <button className="nearest-market-button" onClick={handleFindNearestMarkets}>
              En Yakın 5 Marketi Göster
            </button>

            {/* Market Sonuçlarını Göster */}
            <div className="nearest-markets-container">
              {loadingMarkets && <p>Yükleniyor...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {nearestMarkets.length > 0 && (
                <ul className="nearest-markets-list">
                  {nearestMarkets.map((item, index) => (
                    <li key={index}>
                      <strong>{item.market.name}</strong> - {item.distance} km
                    </li>
                  ))}
                </ul>
              )}
            </div>


          </>
        )}

        {/* Market Önerileri Bölümü KALDIRILDI */}
        
      </div> 
    </div>
  );
}

export default ShoppingCart;