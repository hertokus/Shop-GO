import React, { useRef, useEffect } from 'react';
import './TopBar.css';
import { FaShoppingCart } from 'react-icons/fa';


function TopBar({ cartCount, onCartClick, setCartIconPosition }) {
  const cartIconRef = useRef(null);

  useEffect(() => {
    if (cartIconRef.current && setCartIconPosition) {
      const rect = cartIconRef.current.getBoundingClientRect();
      setCartIconPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [setCartIconPosition]);

  return (
    <div className="top-bar">
      <div className="logo">Shop&GO</div>
      <div className="search-bar">
        <input type="text" placeholder="Ürün ara..." />
      </div>
      <div className="cart" onClick={onCartClick} ref={cartIconRef}>
        <FaShoppingCart size={24} color="white" />
        <span className="cart-count">{cartCount}</span>
      </div>
    </div>
  );
}

export default TopBar;