import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

function ProductList({ selectedCategory, onAddToCart, getCartPosition }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
        // selectedCategory'yi URL'ye ekliyoruz
        const response = await fetch(`http://localhost:5000/api/products/${selectedCategory}`);
        if (!response.ok) {
        throw new Error('Ürünler alınırken bir hata oluştu.');
        }
        const data = await response.json();
        setProducts(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
    };

    fetchProducts();
}, [selectedCategory]);  // selectedCategory değiştiğinde tekrar çek

  

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  // Kategoriye göre filtrelenmiş ürünleri göster (backend'den gelen tüm ürünler)
  const filteredProducts = products.filter(product => {
    // Varsayımsal olarak, eğer her ürünün bir 'category' özelliği varsa:
    return selectedCategory === 'Hepsi' || product.category === selectedCategory;
  });

  return (
    <div className="product-list-container">
    <h2>{selectedCategory}</h2>
    <div className="product-list">
        {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} getCartPosition={getCartPosition} />
        ))}
    </div>
    </div>
);
}

export default ProductList;