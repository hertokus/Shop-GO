// src/pages/CartPage.js - Market Bulma Eklendi (SABİT VERİ GÖSTERİR), Tasarıma Uyarlandı

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';
import './CartPage.css'; // Doğru CSS dosyasını import ettiğinizden emin olun

// App.js'ten gelen proplar
function CartPage({
    cartItems,
    totalAmount,
    onRemoveFromCart,
    onIncreaseQuantity,
    onDecreaseQuantity
}) {
  const navigate = useNavigate();
  const [marketSuggestions, setMarketSuggestions] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [marketError, setMarketError] = useState('');

  // --- ÖNEMLİ DEĞİŞİKLİK ---
  // Artık sampleMarketData'yı burada kullanmıyoruz, çünkü hesaplama yapmıyoruz.
  // İsterseniz silebilirsiniz veya ileride kullanmak üzere yorum satırı yapabilirsiniz.
  /*
  const sampleMarketData = [
     { name: "Market A (Örnek)", address: "Örnek Cad. No: 1", products: { "doritos taco 120g": 17.00, "ülker halley 10lu": 26.00, "lays klasik patates cipsi 150g": 19.50 } },
     { name: "Market B (Daha Ucuz)", address: "Test Sok. No: 5", products: { "doritos taco 120g": 16.50, "ülker halley 10lu": 25.00 } },
     { name: "Market C (Daha Pahalı)", address: "Ana Blv. No: 10", products: { "doritos taco 120g": 18.00, "ülker halley 10lu": 27.00, "lays klasik patates cipsi 150g": 20.00 } }
  ];
  */

  // --- GÜNCELLENMİŞ FONKSİYON ---
  // En uygun marketi bulma fonksiyonu (SABİT VERİ GÖSTERİR)
  const handleFindNearestMarket = () => {
    // Sepet boş olsa bile çalışır
    setIsLoadingMarkets(true);
    setMarketError('');
    setMarketSuggestions([]);

    // Gösterilecek sabit market önerileri (İsimleri ve fiyatları istediğiniz gibi değiştirebilirsiniz)
    const predefinedSuggestions = [
      { name: "A Market (Sabit Öneri)", totalPrice: "145.90", address: "Örnek Cad. No: 1", missingCount: 0 },
      { name: "B Market (Sabit Öneri)", totalPrice: "155.50", address: "Test Sok. No: 5", missingCount: 0 },
      { name: "C Market (Sabit Öneri)", totalPrice: "162.00", address: "Ana Blv. No: 10", missingCount: 0 }
    ].sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice)); // Fiyata göre sıralayalım (isteğe bağlı)

    // Kısa bir gecikme ekleyerek yükleniyor hissi verelim (isteğe bağlı)
    setTimeout(() => {
      setMarketSuggestions(predefinedSuggestions);
      setIsLoadingMarkets(false);
      // Artık her zaman sonuç olacağı için "Uygun market bulunamadı" hatasına gerek yok
    }, 500); // 0.5 saniye bekleme
  };

  // Siparişi tamamlama (placeholder)
    const handleCheckout = () => {
      alert('Sipariş Tamamlama işlemi henüz tanımlanmadı!');
      // navigate('/checkout');
  };

  return (
    // Ana Kapsayıcı Div
    <div className="cart-page-container">
      <h1>Sepetim</h1>

      {/* Sepet Boşsa Gösterilecek Alan */}
      {cartItems.length === 0 ? (
        <div className="empty-cart-message">
          <p>Sepetiniz boş.</p>
          <Link to="/home">Alışverişe Başla</Link>
        </div>
      ) : (
        // Sepet Doluysa Gösterilecek Alan (Fragment içinde)
        <>

          {/* Ürün Listesi ve Sipariş Özeti (İki Sütun) */}
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
            </div> {/* cart-items-column Sonu */}

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
            </div> {/* cart-summary-column Sonu */}
          </div> {/* cart-page-content Sonu */}
        </> // Ana Fragment Sonu (Sepet Doluysa)
      )} {/* Sepet Kontrolü Ternary Sonu */}


        {/* ================================================ */}
        {/* === MARKET ÖNERİ BÖLÜMÜ BURADA === */}
        {/* ================================================ */}
        <div className="market-suggestion-section">
            {/* Market Bul Butonu */}
            <button
                className="find-market-button"
                onClick={handleFindNearestMarket}
                // --- GÜNCELLENMİŞ BUTON KOŞULU ---
                disabled={isLoadingMarkets} // Sadece yüklenirken disable olsun
            >
                {isLoadingMarkets ? 'Marketler Aranıyor...' : 'En Uygun Marketi Bul'}
            </button>

            {/* Hata Mesajı Alanı */}
            {marketError && <p className="market-error">{marketError}</p>}

            {/* Market Önerileri Listesi */}
            {!isLoadingMarkets && !marketError && marketSuggestions.length > 0 && (
                <div className="market-suggestions">
                    <h3>Market Fiyat Önerileri (Sabit Veri):</h3> {/* Başlığı güncelleyebiliriz */}
                    <ul>
                    {marketSuggestions.map((market, index) => (
                        <li key={index}>
                            <div>
                                <strong>{market.name}</strong>
                                {market.address && <small className="address" style={{ marginLeft: '5px', color: '#666'}}>({market.address})</small>}
                            </div>
                            <div>
                                <span>Toplam: {market.totalPrice} ₺</span>
                                {/* Sabit veride eksik ürün olmayacağı varsayıldı */}
                                {/* {market.missingCount > 0 && <small style={{color: 'orange', marginLeft: '10px'}}>({market.missingCount} ürün eksik)</small>} */}
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div> {/* market-suggestion-section Sonu */}

    </div> // cart-page-container Sonu
  );
}

export default CartPage;