import React, { useState } from 'react';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Modal from 'react-modal';
import 'leaflet/dist/leaflet.css';
import './HomePage.css';

Modal.setAppElement('#root');

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  return null;
}

function HomePage({ onAddToCart, activeCategory, onCategorySelect, searchTerm }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addressText, setAddressText] = useState("Konumunuzu seçin");
  const [modalOpen, setModalOpen] = useState(false);

  const handleLocationSelect = async (latlng) => {
  setSelectedLocation(latlng);
  setModalOpen(false);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
    );
    const data = await response.json();
    const address = data.address;

    const parts = [
      address.road,
      address.house_number,
      address.suburb || address.neighbourhood,
      address.city || address.town || address.village,
      address.county,
      address.state,
    ];

    // Sadece tanımlı olanları al
    const filteredParts = parts.filter(Boolean);
    const fullAddress = filteredParts.join(", ");

    setAddressText(fullAddress);
  } catch (err) {
    console.error("Adres alınamadı:", err);
    setAddressText("Adres bulunamadı");
  }
};
 // ✅ return'dan önce fonksiyon kapanıyor
  

  return (
    <div className="home-page">
      {/* 📍 Konum barı */}
      <div className="location-bar" onClick={() => setModalOpen(true)}>
        📍 {addressText}
      </div>

      {/* 📍 Harita modalı */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Haritadan Konum Seç</h2>
        <MapContainer center={[36.96, 35.31]} zoom={13} style={{ height: "300px" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker onLocationSelect={handleLocationSelect} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          )}
        </MapContainer>
        <button className="close-button" onClick={() => setModalOpen(false)}>Kapat</button>
      </Modal>

      {/* Ürünler */}
      <CategoryList onCategorySelect={onCategorySelect} activeCategory={activeCategory} />
      <ProductList
        selectedCategory={activeCategory}
        onAddToCart={onAddToCart}
        searchTerm={searchTerm}
      />
    </div>
  );
}

export default HomePage;
