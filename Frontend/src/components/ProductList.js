import React from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

const productsData = {
  'Atıştırmalık': [
    { id: 1, name: 'Haribo Cips', price: 40.25, image: '/images/haribo-cips.jpg', description: 'Haribo Cips - Atıştırmalık kategorisinde kaliteli ürün.' },
    { id: 2, name: 'Doritos Kraker', price: 8.50, image: '/images/doritos-kraker.jpg', description: 'Doritos Kraker - Atıştırmalık keyfinize keyif katın.' },
    { id: 3, name: 'Çikolata Bar', price: 12.99, image: '/images/cikolata-bar.jpg', description: 'Sütlü çikolata bar - Tatlı ihtiyacınızı giderin.' },
    { id: 4, name: 'Gofret', price: 5.75, image: '/images/gofret.jpg', description: 'İncecik gofret yaprakları arasında krema dolgusu.' },
  ],
  'İçecek': [
    { id: 5, name: 'Su 1.5L', price: 3.50, image: '/images/su.jpg', description: 'Doğal kaynak suyu - Sağlıklı ve ferahlatıcı.' },
    { id: 6, name: 'Gazlı İçecek', price: 9.90, image: '/images/gazli-icecek.jpg', description: 'Serinletici gazlı içecek - Her yudumda keyif.' },
  ],
  'Meyve & Sebze': [
    { id: 7, name: 'Elma KG', price: 15.00, image: '/images/elma.jpg', description: 'Taze ve sulu elmalar - Vitamin deposu.' },
    { id: 8, name: 'Domates KG', price: 12.50, image: '/images/domates.jpg', description: 'Organik domatesler - Salatalarınızın vazgeçilmezi.' },
  ],
  'Süt Ürünleri': [
    { id: 9, name: 'Süt 1L', price: 18.75, image: '/images/sut.jpg', description: 'Taze inek sütü - Kahvaltının olmazsa olmazı.' },
    { id: 10, name: 'Yoğurt 500g', price: 14.20, image: '/images/yogurt.jpg', description: 'Doğal yoğurt - Sağlıklı ve lezzetli.' },
  ],
  'Kahvaltılık': [
    { id: 11, name: 'Ekmek', price: 7.50, image: '/images/ekmek.jpg', description: 'Taze fırın ekmeği - Güne zinde başlayın.' },
    { id: 12, name: 'Peynir', price: 25.99, image: '/images/peynir.jpg', description: 'Tam yağlı beyaz peynir - Kahvaltı sofralarının incisi.' },
  ],
  'Temel Gıda': [
    { id: 13, name: 'Makarna 500g', price: 9.25, image: '/images/makarna.jpg', description: 'Durum buğdayı makarnası - Lezzetli ve doyurucu.' },
    { id: 14, name: 'Pirinç 1KG', price: 16.50, image: '/images/pirinc.jpg', description: 'Osmancık pirinci - Sofraların vazgeçilmezi.' },
  ],
  'Şarküteri': [
    { id: 15, name: 'Salam 250g', price: 28.00, image: '/images/salam.jpg', description: 'Dana salam - Kahvaltı ve sandviçler için ideal.' },
    { id: 16, name: 'Sucuk 250g', price: 35.50, image: '/images/sucuk.jpg', description: 'Fermente sucuk - Acı sevenler için.' },
  ],
  'Dondurulmuş': [
    { id: 17, name: 'Pizza', price: 32.00, image: '/images/pizza.jpg', description: 'Karışık pizza - Pratik ve lezzetli.' },
    { id: 18, name: 'Dondurma', price: 22.75, image: '/images/dondurma.jpg', description: 'Çikolatalı dondurma - Yaz aylarının serinletici lezzeti.' },
  ],
  'Temizlik': [
    { id: 19, name: 'Deterjan', price: 45.00, image: '/images/deterjan.jpg', description: 'Çamaşır deterjanı - Güçlü temizlik etkisi.' },
    { id: 20, name: 'Çamaşır Suyu', price: 19.90, image: '/images/camasirsuyu.jpg', description: 'Çamaşır suyu - Hijyenik temizlik sağlar.' },
  ],
  'Ev & Yaşam': [
    { id: 21, name: 'Bardak Seti', price: 29.99, image: '/images/bardak.jpg', description: '6\'lı cam bardak seti - Şık ve kullanışlı.' },
    { id: 22, name: 'Tabak Seti', price: 49.50, image: '/images/tabak.jpg', description: '12 parçalık yemek tabağı seti - Sofralarınıza zarafet katın.' },
  ],
};

function ProductList({ selectedCategory, onAddToCart }) {
  const products = productsData[selectedCategory] || [];

  return (
    <div className="product-list-container">
      <h2>{selectedCategory}</h2>
      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;