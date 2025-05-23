// screens/CompareScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Linking, Alert, Platform // Platform ve Alert import edildi
} from 'react-native';

export default function CompareScreen({ route }) {
  const { cartItems } = route.params;
  const [marketResults, setMarketResults] = useState([]);
  const [loading, setLoading] = useState(true); // Başlangıçta true olmalı

  // Sabit enlem ve boylam (gerekirse dinamik hale getirilebilir)
  const latitude = "36.96190930911481";
  const longitude = "35.310083720241444";

  useEffect(() => {
      fetch('http://192.168.105.194:5000/api/calculate-list-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          shopping_list: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log("Market verileri:", data);
          setMarketResults(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("API hatası:", error);
          setLoading(false);
        });
    }, []);
  
    // ✅ Koordinatla yol tarifi açma
    const openInGoogleMaps = (lat, lon) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      Linking.openURL(url).catch(err => console.error("Google Maps açılamadı:", err));
    };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#005800" />
        <Text style={styles.loadingText}>Market fiyatları hesaplanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Karşılaştırması</Text>
      {marketResults.length > 0 ? (
        <FlatList
          data={marketResults}
          keyExtractor={(item, index) => item.market_id ? item.market_id.toString() : index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.marketName}>{item.market_name || 'Bilinmeyen Market'}</Text>
              <Text style={styles.infoText}>Mesafe: {item.distance != null ? item.distance.toFixed(2) : 'N/A'} km</Text>
              <Text style={styles.priceText}>Toplam Fiyat: {item.total_list_price != null ? item.total_list_price.toFixed(2) : 'N/A'} {item.currency || 'TL'}</Text>
              {item.unavailable_items_count > 0 && (
                <View>
                  <Text style={styles.unavailableText}>
                    Eksik Ürün Sayısı: {item.unavailable_items_count}
                  </Text>
                  {item.unavailable_item_details && item.unavailable_item_details.length > 0 && (
                     item.unavailable_item_details.map((detail, idx) => (
                        <Text key={idx} style={styles.unavailableDetailText}> - {detail.name || `ID: ${detail.productId}`}</Text>
                    ))
                  )}
                </View>
              )}
              {(item.latitude != null && item.longitude != null) && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => openInGoogleMaps(item.latitude, item.longitude)}
                >
                  <Text style={styles.mapButtonText}>Yol Tarifi Al</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noResultsText}>
          {(!cartItems || cartItems.length === 0)
            ? "Karşılaştırma yapmak için lütfen sepetinize ürün ekleyin."
            : "Bu sepet için uygun market bulunamadı veya tüm marketlerde ürünler eksik."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop:10,
    fontSize: 16,
    color: '#333'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Daha ince gölge
    shadowOpacity: 0.08, // Daha hafif gölge
    shadowRadius: 3, // Daha yumuşak gölge
    elevation: 2, // Android için hafif gölge
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005800',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  priceText: {
    fontSize: 16, // Fiyat punto boyutu biraz artırıldı
    color: '#111', // Daha koyu fiyat rengi
    fontWeight: '700', // Fiyatı daha belirgin yap
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 14,
    color: 'red',
    fontStyle: 'italic',
    marginBottom: 4, // Detaylar için boşluk
  },
  unavailableDetailText: {
    fontSize: 13,
    color: '#404040', // Detaylar için biraz daha açık renk
    marginLeft: 10, // İçeri girinti
    fontStyle: 'italic',
  },
  mapButton: {
    backgroundColor: '#005800',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginTop: 12, // Diğer bilgilerle arasında boşluk
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6c757d',
    paddingHorizontal: 20, // Uzun mesajların taşmaması için
  },
});