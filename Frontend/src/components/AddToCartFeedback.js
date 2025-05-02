// src/components/AddToCartFeedback.js
import React, { useState, useEffect } from 'react';
import './AddToCartFeedback.css'; // Stil dosyasını oluşturacağız

function AddToCartFeedback({ productName, quantity, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(); // Ana bileşene kaybolma bilgisini ver
    }, 2000); // 3 saniye sonra kaybol

    return () => clearTimeout(timer); // Bileşen unmount olursa timer'ı temizle
  }, []);

  return (
    isVisible && (
      <div className="add-to-cart-feedback">
        {productName} x{quantity} sepete eklendi!
      </div>
    )
  );
}

export default AddToCartFeedback;