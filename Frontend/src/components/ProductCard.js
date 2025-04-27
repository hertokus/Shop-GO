import React, { useState, useRef } from 'react';
import './ProductCard.css';

function ProductCard({ product, onAddToCart, getCartPosition }) {
  const cardRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCartClick = () => {
    onAddToCart(product);
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
        }, 500); // Animasyon süresi
      }
    }
  };

  return (
    <div className="product-card" ref={cardRef}>
      <div className="product-image-container">
        {product.image && <img src={product.image} alt={product.name} className="product-image" />}
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
      </div>
    </div>
  );
}

export default ProductCard;