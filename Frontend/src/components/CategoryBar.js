import React from 'react';
import './CategoryBar.css'; // Birazdan oluşturacağımız CSS dosyası

function CategoryBar({ categories, activeCategory, onCategorySelect }) {
  return (
    <div className="category-bar-container">
      <nav className="category-bar">
        {categories.map((category) => (
          <button
            key={category.id || category.name} // Kategori objesi veya string olabilir
            className={`category-button ${
              activeCategory === (category.name || category) ? 'active' : ''
            }`}
            onClick={() => onCategorySelect(category.name || category)}
          >
            {category.displayName || category.name || category} {/* Gösterilecek isim için esneklik */}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default CategoryBar;
