// src/components/ShoppingCart.js
import React from 'react'; // useState'e gerek kalmadı (kullanılmıyorsa)
import './ShoppingCart.css';
import { AiOutlineClose } from 'react-icons/ai';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// isOpen prop'u eklendi, totalAmount prop'u artık kullanılmayacak (veya farklı bir anlamda)
function ShoppingCart({
  cartItems,      // Artık fiyatsız ürünleri içeren alışveriş listesi
  onRemoveFromCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onCloseCart,
  isOpen
  // totalAmount prop'u artık bu bileşen için doğrudan bir fiyat toplamı ifade etmiyor.
}) {
  const navigate = useNavigate();

  // nearestMarkets, loadingMarkets, error state'leri bu dropdown için gereksiz görünüyor,
  // bu mantık CartPage.js'e ait. Eğer burada kullanılmayacaksa kaldırılabilir.
  // const [nearestMarkets, setNearestMarkets] = useState([]);
  // const [loadingMarkets, setLoadingMarkets] = useState(false);
  // const [error, setError] = useState(null);

  const handleGoToCartPage = () => { // Fonksiyon adı daha açıklayıcı olabilir
    onCloseCart(); // Sepet dropdown'ını kapat
    navigate('/cart'); // Tam alışveriş listesi ve market fiyatları sayfasına yönlendir
  };

  // Alışveriş listesindeki toplam ürün adedini (çeşit değil, toplam miktar) hesaplayalım
  const totalItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={`shopping-cart-dropdown ${isOpen ? 'open' : ''}`}>
      <div className="cart-content">
        <div className="cart-header">
          <h2>Alışveriş Listem</h2> {/* Başlık güncellendi */}
          <button className="close-button-cart" onClick={onCloseCart}>
            <AiOutlineClose size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-message">
            <p>Listeniz şu an boş.</p> {/* Mesaj güncellendi */}
          </div>
        ) : (
          <>
            <ul className="cart-item-list">
              {cartItems.map((item) => (
                // item.productId kullandığımızı varsayıyoruz (App.js'teki handleAddToCart'a göre)
                <li key={item.productId} className="cart-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    {/* FİYAT GÖSTERİMİ KALDIRILDI */}
                    {/* <span className="item-price">{item.price.toFixed(2)} ₺</span> */}
                    {/* İsteğe bağlı: Ürün birimi gösterilebilir */}
                    {item.unit && <span className="item-unit-display">({item.unit})</span>}
                  </div>
                  <div className="item-controls">
                    <button
                      className="remove-item-btn"
                      onClick={() => onRemoveFromCart(item.productId)} // productId kullanılmalı
                      aria-label={`${item.name} ürününü listeden çıkar`}
                    >
                      <FaTrashAlt />
                    </button>
                    <div className="item-quantity-adjuster">
                      <button
                        onClick={() => onDecreaseQuantity(item.productId)} // productId kullanılmalı
                        disabled={item.quantity <= 1}
                        aria-label={`${item.name} adetini azalt`}
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="item-quantity">{item.quantity}</span>
                      <button
                        onClick={() => onIncreaseQuantity(item.productId)} // productId kullanılmalı
                        aria-label={`${item.name} adetini artır`}
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <button className="go-to-cart-button" onClick={handleGoToCartPage}>
              <span>Listeye Git</span>
              {/* Toplam fiyat yerine toplam ürün adedini gösterebiliriz */}
              {totalItemCount > 0 && (
                <span className="total-item-count-badge">{totalItemCount} ürün</span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ShoppingCart;
