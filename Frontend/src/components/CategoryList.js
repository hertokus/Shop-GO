import React from 'react';
import './CategoryList.css';

const categories = [
  'Atıştırmalık',
  'İçecek',
  'Meyve & Sebze',
  'Süt Ürünleri',
  'Kahvaltılık',
  'Temel Gıda',
  'Şarküteri',
  'Dondurulmuş',
  'Temizlik',
  'Ev & Yaşam',
];

function CategoryList({ onCategorySelect, activeCategory }) {
  return (
    <div className="category-list-container">
      <ul className="category-list">
        {categories.map((category) => (
          <li
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`category-item ${activeCategory === category ? 'active' : ''}`}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryList;