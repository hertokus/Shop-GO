import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, Button, Alert, TouchableOpacity
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Çıkış işlemi
  const handleLogout = () => {
  Alert.alert(
    'Çıkış Yap',
    'Gerçekten çıkış yapmak istiyor musun?',
    [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Evet',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('Görüşürüz!', 'Tekrar bekleriz 😊');
          navigation.replace('Login');
        }
      }
    ]
  );
};


  // Ürünleri API'den al
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

  // Android geri tuşu kontrolü
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Çıkmak istiyor musun?',
          'Uygulamadan çıkmak üzeresin.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çık', onPress: () => BackHandler.exitApp() }
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  // Sepete ürün ekle
  const addToCart = (product) => {
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    if (existingIndex !== -1) {
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += 1; // Miktarı artır
      setCartItems(updatedItems);
      Alert.alert("Ürün tekrar eklendi", `Miktar: ${updatedItems[existingIndex].quantity}`);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
      Alert.alert("Listeye eklendi", product.name);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Başlık ve Çıkış */}
      <View style={styles.header}>
        <Text style={styles.title}>Ürün Listesi</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
  <Text style={styles.logoutText}>Çıkış Yap</Text>
</TouchableOpacity>

      </View>

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
        <Button
          title="Listeyi Gör"
          onPress={() => navigation.navigate("Cart", { cartItems })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  logout: { color: 'red', fontWeight: 'bold', fontSize: 16 },
  productItem: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10
  },
  image: { width: 50, height: 50, marginRight: 10 },
  productName: { fontSize: 16 },
  productUnit: { fontSize: 14, color: '#666' },
  footer: { marginTop: 20 },
  logoutBtn: {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: '#ff4d4f',
  borderRadius: 8,
  backgroundColor: '#fff'
},
logoutText: {
  color: '#ff4d4f',
  fontWeight: 'bold',
  fontSize: 16
},



});
