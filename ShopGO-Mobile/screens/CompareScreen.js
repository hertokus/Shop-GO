// screens/CompareScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Linking, Alert, Platform // Alert ve Platform eklendi
} from 'react-native';

const YOUR_YELLOW_COLOR = '#ffe643'; // Sizin sarı tonunuz
const CUSTOM_GREEN_COLOR = '#005800'; // Sizin yeşil tonunuz

export default function CompareScreen({ route }) {
  const { cartItems } = route.params;
  const [marketResults, setMarketResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bu koordinatlar örnek, dinamik hale getirilmesi daha iyi olur.
  const latitude = "36.96190930911481";
  const longitude = "35.310083720241444";

  useEffect(() => {
    // API IP adresinizi kontrol edin ve gerekiyorsa güncelleyin
    fetch('http://192.168.1.11:5000/api/calculate-list-prices', {
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
      .then(async res => { // async eklendi
        if (!res.ok) {
          // Sunucudan JSON formatında bir hata mesajı gelmiş olabilir
          const errorData = await res.json().catch(() => null); // Hata mesajını parse etmeye çalış
          const errorMessage = errorData?.message || `Sunucu hatası: ${res.status}`;
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then(data => {
        // console.log("Market verileri:", data);
        setMarketResults(Array.isArray(data) ? data : []); // Gelen verinin dizi olduğundan emin ol
        setLoading(false);
      })
      .catch(error => {
        console.error("API hatası (CompareScreen):", error);
        Alert.alert("Hata", error.message || "Market verileri alınırken bir sorun oluştu.");
        setMarketResults([]); // Hata durumunda market listesini boşalt
        setLoading(false);
      });
  }, [cartItems]); // cartItems değiştiğinde yeniden fetch et

  const handleGetDirections = (lat, lon, label = "Market") => {
    if (!lat || !lon) {
        Alert.alert("Konum Bilgisi Eksik", "Bu market için konum bilgisi bulunamadı.");
        return;
    }
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}${lat},${lon}?q=${encodeURIComponent(label)}`;
    
    Linking.openURL(url).catch(err => {
      console.error("Harita açılamadı:", err);
      Alert.alert('Hata', 'Harita uygulaması açılamadı. Cihazınızda bir harita uygulaması yüklü olduğundan emin olun.');
    });
  };

  const renderMarketCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.marketName}>{item.market_name || "Bilinmeyen Market"}</Text>
      <Text style={styles.marketInfo}>Mesafe: {item.distance?.toFixed(2) || 'N/A'} km</Text>
      <Text style={styles.marketInfo}>Toplam Fiyat: {item.total_list_price?.toFixed(2) || 'N/A'} {item.currency || '₺'}</Text>
      {item.unavailable_items_count > 0 && (
        <Text style={styles.unavailableText}>
          Listeden {item.unavailable_items_count} ürün bu markette bulunmuyor.
        </Text>
      )}
      <TouchableOpacity
        style={styles.directionButton} // Stil adı directionButton olarak güncellendi
        onPress={() => handleGetDirections(item.latitude, item.longitude, item.market_name)}
      >
        <Text style={styles.directionButtonText}>Yol Tarifi Al</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Karşılaştırması</Text>
      {loading ? (
        <ActivityIndicator size="large" color={CUSTOM_GREEN_COLOR} style={{ marginTop: 50 }}/>
      ) : marketResults.length > 0 ? (
        <>
          <Text style={styles.resultCountText}>
            Toplam {marketResults.length} market bulundu.
          </Text>
          <FlatList
            data={marketResults}
            // market_id varsa kullan, yoksa index'e fallback yap (API yanıtında market_id olmalı)
            keyExtractor={(item, index) => item.market_id?.toString() || index.toString()}
            renderItem={renderMarketCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      ) : (
        <Text style={styles.noResultsText}>Karşılaştırılacak market bulunamadı veya bir hata oluştu.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, // Yatay padding
    paddingTop: 20, // Üstten padding
    paddingBottom: 10, // Alttan padding
    backgroundColor: '#f8f9fa', // Genel sayfa arka planı
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  resultCountText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 15,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 50,
  },
  card: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: YOUR_YELLOW_COLOR, // GÜNCELLENMİŞ SARI RENK
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333', // Sarı arka plan üzerinde koyu renk
  },
  marketInfo: {
    fontSize: 15,
    marginBottom: 5,
    color: '#444', // Sarı arka plan üzerinde koyu renk
  },
  unavailableText: {
    fontSize: 14,
    color: '#D32F2F', // Kırmızı uyarı rengi
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 10,
  },
  directionButton: { // Stil adı mapButton'dan directionButton'a değiştirildi (daha genel)
    backgroundColor: CUSTOM_GREEN_COLOR, // GÜNCELLENMİŞ YEŞİL RENK
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  directionButtonText: { // Stil adı mapButtonText'ten directionButtonText'e değiştirildi
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});