import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button, Alert } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.15:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("API Hatası:", error);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      Alert.alert("Ürün zaten listede!");
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
      Alert.alert("Listeye eklendi", product.name);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ürün Listesi</Text>
      {loading ? (
        <Text>Yükleniyor...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
              </View>
              <Button title="Ekle" onPress={() => addToCart(item)} />
            </View>
          )}
        />
      )}
      <View style={styles.footer}>
        <Button title="Listeyi Gör" onPress={() => navigation.navigate("Cart", { cartItems })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  productItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  image: { width: 50, height: 50, marginRight: 10 },
  productName: { fontSize: 16 },
  productUnit: { fontSize: 14, color: '#666' },
  footer: { marginTop: 20 }
});
