import React from 'react';
// import CategoryList from '../components/CategoryList'; // Bu satır kaldırıldı
import ProductList from '../components/ProductList';
// HomePage.css içindeki CategoryList ile ilgili stiller de kaldırılabilir.

function HomePage({ onAddToCart, activeCategory, searchTerm }) {
  // onCategorySelect prop'u artık HomePage tarafından kullanılmıyor.
  return (
    <div className="home-page">
      {/* CategoryList buradan kaldırıldı, CategoryBar App.js seviyesinde eklendi */}
      <ProductList
        selectedCategory={activeCategory} // ProductList hala aktif kategoriye göre ürünleri filtreleyebilir
        onAddToCart={onAddToCart}
        searchTerm={searchTerm}
      />
    </div>
  );
}

export default HomePage;
