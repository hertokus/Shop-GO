// src/components/ProductCard.js
import React, { useState, useRef, useEffect } from 'react';
import './ProductCard.css';
import AddToCartFeedback from './AddToCartFeedback'; // Bu bileşen hala kullanılabilir

function ProductCard({ product, onAddToCart, getCartPosition }) {
    const cardRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const feedbackTimeoutRef = useRef(null);

    useEffect(() => {
        // Feedback mesajının zaman aşımı yönetimi
        if (feedback) {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
            feedbackTimeoutRef.current = setTimeout(() => {
                setFeedback(null);
                feedbackTimeoutRef.current = null;
            }, 1000); // 1 saniye sonra feedback mesajını kaldır
        }
        // Cleanup fonksiyonu
        return () => {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, [feedback]);

    const handleAddToCartClick = () => {
        // onAddToCart fonksiyonuna product objesini iletiyoruz.
        // App.js'teki handleAddToCart fonksiyonu bu product objesinden
        // id, name, category, unit, image_url gibi fiyatsız bilgileri alacak.
        // Bu nedenle, ProductList'ten gelen 'product' objesinin bu alanları içermesi önemlidir.
        onAddToCart(product);

        // Feedback mesajı için state güncellemesi
        setFeedback(prev => ({
            id: Date.now(),
            quantity: prev && prev.productName === product.name ? prev.quantity + 1 : 1,
            productName: product.name
        }));

        // Animasyon mantığı (fiyattan bağımsız olduğu için aynı kalabilir)
        if (cardRef.current && getCartPosition) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const cartPosition = getCartPosition();

            if (cartPosition) {
                setIsAnimating(true);
                const animatable = document.createElement('div');
                animatable.className = 'fly-to-cart';
                animatable.style.left = `${cardRect.left + cardRect.width / 2}px`;
                animatable.style.top = `${cardRect.top + cardRect.height / 2}px`;
                // İsteğe bağlı: Animasyon için ürün resmini kullanabilirsiniz
                if (product.image_url) {
                    const img = new Image();
                    img.src = product.image_url;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    animatable.appendChild(img);
                }
                document.body.appendChild(animatable);

                const deltaX = cartPosition.x - (cardRect.left + cardRect.width / 2);
                const deltaY = cartPosition.y - (cardRect.top + cardRect.height / 2);

                animatable.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
                animatable.style.opacity = 0;

                setTimeout(() => {
                    if (animatable.parentNode) {
                        document.body.removeChild(animatable);
                    }
                    setIsAnimating(false);
                }, 500); // Animasyon süresi
            }
        }
    };

    const handleFeedbackClose = () => {
        setFeedback(null);
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = null;
        }
    };

    // product objesinin beklenen alanlara sahip olduğunu varsayıyoruz:
    // product.id (veritabanındaki ürün ID'si)
    // product.name
    // product.image_url
    // product.description (isteğe bağlı)
    // product.category (App.js'teki handleAddToCart'ta kullanılmak üzere)
    // product.unit (App.js'teki handleAddToCart'ta kullanılmak üzere)

    return (
        <div className="product-card" ref={cardRef}>
            <div className="product-image-container">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="product-image" />
                ) : (
                    <div className="product-image-placeholder">Resim Yok</div>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name || "Ürün Adı Yok"}</h3>
                {/* product.unit bilgisi API'den geliyorsa ve göstermek isterseniz: */}
                {/* {product.unit && <span className="product-unit">({product.unit})</span>} */}
                {product.description && <p className="product-description">{product.description}</p>}
                
                <div className="product-price-add">
                    {/* FİYAT GÖSTERİMİ KALDIRILDI */}
                    
                    <button 
                        className="add-to-cart-button" 
                        onClick={handleAddToCartClick} 
                        disabled={isAnimating}
                    >
                        Listeye Ekle 
                    </button>
                </div>

                {feedback && (
                    <AddToCartFeedback
                        key={feedback.id}
                        productName={feedback.productName}
                        quantity={feedback.quantity}
                        onClose={handleFeedbackClose}
                    />
                )}
            </div>
        </div>
    );
}

export default ProductCard;
