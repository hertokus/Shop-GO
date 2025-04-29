import React from 'react'; // useState'e gerek kalmadı
import './ShoppingCart.css'; // Güncellenmiş CSS dosyasını import ediyoruz
import { AiOutlineClose } from 'react-icons/ai'; 
// İkonları ekleyelim (react-icons kütüphanesini kurduğunuzu varsayıyorum: npm install react-icons)
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; // Sepete git butonu için

// isOpen ve totalAmount prop'larını ekledik
function ShoppingCart({ 
    cartItems, 
    onRemoveFromCart, 
    onIncreaseQuantity, 
    onDecreaseQuantity, 
    onCloseCart,
    isOpen,        // Sepetin açık/kapalı durumunu kontrol eder
    totalAmount    // Toplam tutarı App.js'ten alacağız
}) {
  
  const navigate = useNavigate(); // Yönlendirme hook'u

  // Market önerileri state'i ve fonksiyonu kaldırıldı
  // const [marketSuggestions, setMarketSuggestions] = useState([]);
  // const handleFindNearestMarket = () => { ... };

  const handleGoToCart = () => {
      onCloseCart(); // Sepet dropdown'ını kapat
      navigate('/cart'); // Tam sepet sayfasına yönlendir (bu route'u oluşturmanız gerekebilir)
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
          </>
        )}

        {/* Market Önerileri Bölümü KALDIRILDI */}
        
      </div> 
    </div>
  );
}

export default ShoppingCart;