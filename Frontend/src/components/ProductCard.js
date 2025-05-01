import React, { useState, useRef, useEffect } from 'react';
import './ProductCard.css';
import AddToCartFeedback from './AddToCartFeedback';

function ProductCard({ product, onAddToCart, getCartPosition }) {
    const cardRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const feedbackTimeoutRef = useRef(null);

    useEffect(() => {
        if (feedback) {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }

            feedbackTimeoutRef.current = setTimeout(() => {
                setFeedback(null);
                feedbackTimeoutRef.current = null;
            }, 1000);
        }
    }, [feedback]);

    const handleAddToCartClick = () => {
        onAddToCart(product);

        // Her tıklamada yeni id üret ve quantity'yi artır
        setFeedback(prev => ({
            id: Date.now(), // her seferinde farklı olsun ki useEffect çalışsın
            quantity: prev && prev.productName === product.name ? prev.quantity + 1 : 1,
            productName: product.name
        }));

        // Animasyon
        if (cardRef.current && getCartPosition) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const cartPosition = getCartPosition();

            if (cartPosition) {
                setIsAnimating(true);
                const animatable = document.createElement('div');
                animatable.className = 'fly-to-cart';
                animatable.style.left = `${cardRect.left + cardRect.width / 2}px`;
                animatable.style.top = `${cardRect.top + cardRect.height / 2}px`;
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
                }, 500);
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

    return (
        <div className="product-card" ref={cardRef}>
            <div className="product-image-container">
                {product.image_url && <img src={product.image_url} alt={product.name} className="product-image" />}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.description && <p className="product-description">{product.description}</p>}
                <div className="product-price-add">
                    <span className="product-price">{product.price} ₺</span>
                    <button className="add-to-cart-button" onClick={handleAddToCartClick} disabled={isAnimating}>
                        Ekle
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
