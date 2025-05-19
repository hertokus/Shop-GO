// src/pages/HomePage.js
import React from 'react';
import ProductList from '../components/ProductList';
const user = JSON.parse(localStorage.getItem("user"));

// HomePage.css içindeki CategoryList ile ilgili stiller de kaldırılabilir/güncellenebilir.

function HomePage({ onAddToCart, activeCategory, searchTerm }) {

  
  // onCategorySelect prop'u artık HomePage tarafından kullanılmıyor,
  // CategoryBar App.js seviyesinde yönetiliyor.
  return (
    <div className="home-page">
      {/* ProductList bileşeni, App.js'ten gelen onAddToCart fonksiyonunu alır.
        Bu onAddToCart fonksiyonu, fiyatsız ürünleri alışveriş listesine eklemek üzere güncellenmiştir.
        ProductList'in ve içindeki ProductCard'ın da bu fiyatsız ürün mantığına uygun
        product objelerini (id, name, category, unit, image_url içeren) işlemesi gerekir.
      */}
      <ProductList
        selectedCategory={activeCategory}
        onAddToCart={onAddToCart} // App.js'ten gelen güncellenmiş fonksiyon
        searchTerm={searchTerm}
        // getCartPosition prop'u ProductList'te tanımlıysa ve ProductCard'a iletiliyorsa
        // ve hala bir animasyon için gerekliyse burada da iletilmeye devam edebilir.
        // Eğer ProductList'te bu prop tanımlı değilse, buraya eklemeniz veya
        // ProductList'in bu prop'u alıp ProductCard'a geçirmesi gerekir.
        // Şimdilik ProductList'in bu prop'u aldığını varsayıyorum.
      />
    </div>
  );
}

export default HomePage;
