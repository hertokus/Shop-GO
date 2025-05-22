import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Linking
} from 'react-native';

export default function CompareScreen({ route }) {
  const { cartItems } = route.params;
  const [marketResults, setMarketResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const latitude = "36.96190930911481";
  const longitude = "35.310083720241444";

  useEffect(() => {
    fetch('http://192.168.1.15:5000/api/calculate-list-prices', {
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

  const openInGoogleMaps = (lat, lon, label = "Market") => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${label}`;
    Linking.openURL(url).catch(err => console.error("Google Maps açılamadı:", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Karşılaştırması</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={{ fontSize: 12, marginBottom: 5 }}>
            Toplam {marketResults.length} market bulundu.
          </Text>
          <FlatList
            data={marketResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.marketName}>{item.market_name}</Text>
                <Text>Mesafe: {item.distance.toFixed(2)} km</Text>
                <Text>Toplam Fiyat: {item.total_list_price.toFixed(2)} {item.currency}</Text>
                {item.unavailable_items_count > 0 && (
                  <Text style={{ color: 'red' }}>
                    Eksik Ürün: {item.unavailable_items_count}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => openInGoogleMaps(item.latitude, item.longitude, item.market_name)}
                >
                  <Text style={styles.mapButtonText}>Yol Tarifi Al</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10
  },
  marketName: { fontSize: 16, fontWeight: 'bold' },
  mapButton: {
    backgroundColor: '#2D9CDB',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center'
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
