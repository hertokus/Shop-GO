// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

function ProductList({ selectedCategory, onAddToCart, searchTerm, getCartPosition }) { // getCartPosition eklendi (eğer kullanılıyorsa)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      console.log(`ProductList: "${selectedCategory || 'Tüm Ürünler'}" kategorisi için ürünler çekiliyor...`);
      try {
        // API endpoint'i kategoriye göre filtrelenmiş veya tüm ürünleri fiyatsız olarak dönmeli.
        // Örnek API'den dönen product objesi: { id, name, category, unit, image_url, description (isteğe bağlı) }
        const apiUrl = selectedCategory && selectedCategory !== 'Hepsi' // 'Hepsi' gibi bir değeriniz varsa
          ? `http://localhost:5000/api/products/category/${selectedCategory}` // Kategori endpoint'i değişebilir
          : `http://localhost:5000/api/products`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Ürünler alınırken bir hata oluştu.');
        }
        const data = await response.json();
        // Gelen data'nın bir dizi olduğundan ve her ürünün beklenen alanlara sahip olduğundan emin olun.
        setProducts(data);
      } catch (error) {
        setError(error.message);
        setProducts([]); // Hata durumunda ürünleri boşalt
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Arama terimine göre filtreleme (bu kısım aynı kalabilir)
  const searchFilteredProducts = products.filter(product => {
    return searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  if (loading) {
    return <div className="product-list-feedback">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="product-list-feedback product-list-error">Hata: {error}</div>;
  }

  return (
    <div className="product-list-container">
      {/* Başlık isteğe bağlı, kategori adı zaten CategoryBar'da vurgulanıyor olabilir */}
      {/* <h2>{selectedCategory || 'Tüm Ürünler'}</h2> */}
      <div className="product-list">
        {searchFilteredProducts.length > 0 ? (
          searchFilteredProducts.map((product) => (
            <ProductCard
              key={product.id} // Ürünün benzersiz ID'si
              product={product} // API'den gelen fiyatsız ürün objesi
              onAddToCart={onAddToCart} // App.js'ten gelen güncellenmiş fonksiyon
              // getCartPosition prop'u ProductCard tarafından kullanılıyorsa iletilmeli
              getCartPosition={getCartPosition} 
            />
          ))
        ) : (
          <p className="product-list-feedback">
            {searchTerm 
              ? `"${selectedCategory || 'Tüm Ürünler'}" kategorisinde "${searchTerm}" ile eşleşen ürün bulunamadı.`
              : `"${selectedCategory || 'Tüm Ürünler'}" kategorisinde ürün bulunamadı.`
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductList;
