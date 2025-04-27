import React from 'react';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';

function HomePage({ onAddToCart, activeCategory, onCategorySelect }) {
  return (
    <div className="home-page">
      <CategoryList onCategorySelect={onCategorySelect} activeCategory={activeCategory} />
      <ProductList selectedCategory={activeCategory} onAddToCart={onAddToCart} />
    </div>
  );
}

export default HomePage;