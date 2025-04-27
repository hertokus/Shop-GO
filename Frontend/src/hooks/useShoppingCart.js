import { useState } from 'react';

function useShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

  return { cartItems, addToCart, removeFromCart, totalAmount };
}

export default useShoppingCart;