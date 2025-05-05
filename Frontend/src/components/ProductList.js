import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

// HomePage'den gelen searchTerm prop'unu ekle
function ProductList({ selectedCategory, onAddToCart, getCartPosition, searchTerm }) {
  const [products, setProducts] = useState([]); // Backend'den gelen (kategoriye göre filtrelenmiş) ürünler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      console.log(`ProductList: ${selectedCategory} kategorisi için ürünler çekiliyor...`); // Log eklendi
      try {
        // Backend'den kategoriye göre filtrelenmiş ürünleri çek
        const apiUrl = selectedCategory && selectedCategory !== 'Hepsi'
          ? `http://localhost:5000/api/products/${selectedCategory}` // Kategori varsa URL'e ekle
          : `http://localhost:5000/api/products`; // Kategori 'Hepsi' ise veya yoksa tüm ürünleri çek (Backend bunu destekliyorsa)

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Ürünler alınırken bir hata oluştu.');
        }
        const data = await response.json();
        setProducts(data); // Gelen veriyi state'e ata
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]); // selectedCategory değiştiğinde tekrar çek

  // ----> YENİ: Arama terimine göre filtreleme <----
  // Backend'den gelen (ve zaten kategoriye göre filtrelenmiş olan) 'products' listesini kullan
  const searchFilteredProducts = products.filter(product => {
    // Eğer arama terimi varsa, ürün adının arama terimini içerip içermediğine bak
    // Büyük/küçük harf duyarsız arama yap
    return searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true; // Arama terimi yoksa (boşsa), tüm ürünleri göster (true döndür)
  });
  // ----> YENİ SONU <----


  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  // Eski frontend kategori filtrelemesi kaldırıldı, çünkü backend yapıyor varsayıyoruz.

  return (
    <div className="product-list-container">
      <h2>{selectedCategory || 'Tüm Ürünler'}</h2> {/* Kategori adını göster */}
      {/* Filtrelenmiş ürün listesini map ile dön */}
      <div className="product-list">
        {searchFilteredProducts.length > 0 ? ( // Eğer filtrelenmiş ürün varsa
          searchFilteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              getCartPosition={getCartPosition} // Bu prop hala gerekli mi kontrol et
            />
          ))
        ) : (
          // Filtreleme sonucu ürün yoksa mesaj göster
          <p>"{selectedCategory}" kategorisinde "{searchTerm}" ile eşleşen ürün bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

export default ProductList;