import React from 'react';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';

// App.js'den gelen searchTerm prop'unu ekle
function HomePage({ onAddToCart, activeCategory, onCategorySelect, searchTerm }) {
  return (
    <div className="home-page">
      <CategoryList onCategorySelect={onCategorySelect} activeCategory={activeCategory} />
      {/* ProductList'e searchTerm prop'unu aktar */}
      <ProductList
        selectedCategory={activeCategory}
        onAddToCart={onAddToCart}
        searchTerm={searchTerm} // Yeni eklenen prop
      />
    </div>
  );
}

export default HomePage;