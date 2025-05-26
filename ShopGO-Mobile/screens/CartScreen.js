// screens/CartScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import edildi

const CUSTOM_GREEN_COLOR = '#005800';
const CART_STORAGE_KEY = 'userShopGoCartItems'; // HomeScreen ile aynı key'i kullanalım

export default function CartScreen({ route, navigation }) {
  const [currentCartItems, setCurrentCartItems] = useState([]);

  // Sepeti route.params'tan yükle
  useEffect(() => {
    const initialItems = (route.params?.cartItems || []).map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));
    setCurrentCartItems(initialItems);
  }, [route.params?.cartItems]);

  // currentCartItems her değiştiğinde AsyncStorage'a kaydet
  useEffect(() => {
    const saveCartToStorage = async () => {
      try {
        // currentCartItems null veya undefined değilse ve yüklendiyse kaydet
        if (currentCartItems) {
          console.log('CartScreen - Sepet AsyncStoragea kaydediliyor:', currentCartItems);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCartItems));
        }
      } catch (error) {
        console.error('CartScreen - Sepet AsyncStoragea kaydedilemedi:', error);
      }
    };
    // İlk yüklemede route.params'tan gelen items ile currentCartItems hemen güncelleneceği için
    // bu effect çalışacak ve ilk sepet durumunu da kaydetmiş olacak.
    saveCartToStorage();
  }, [currentCartItems]);


  const handleIncreaseQuantity = (itemId) => {
    setCurrentCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: (item.quantity || 0) + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setCurrentCartItems(prevItems => {
      const newCart = prevItems.map(item => {
        if (item.id === itemId) {
          return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : null;
        }
        return item;
      });
      return newCart.filter(Boolean);
    });
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Ürünü Sil",
      "Bu ürünü listenizden kaldırmak istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          onPress: () => {
            setCurrentCartItems(prevItems =>
              prevItems.filter(item => item.id !== itemId)
            );
          },
          style: "destructive"
        }
      ]
    );
  };

  // ... (renderCartItem, JSX ve stiller aynı kalacak, beforeRemove listener'ı kaldırılacak)
  // ... (Bir önceki mesajdaki CartScreen JSX ve stillerini kullanabilirsiniz)
  // ... Sadece beforeRemove useEffect'ini silin.
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alışveriş Listem</Text>
      {currentCartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyCartText}>Sepetiniz boş!</Text>
          <TouchableOpacity
            onPress={() => {
                // Sepet boşken Home'a dönerken de sepetin boş olduğunu Home'un bilmesi iyi olur.
                // Bu, AsyncStorage'a zaten kaydedilmiş olacak.
                // CommonActions.reset yerine sadece navigate veya goBack daha iyi olabilir.
                // Eğer Home'a dönerken stack'i sıfırlamak istemiyorsak:
                navigation.navigate('Home'); // Veya navigation.goBack();
            }}
          >
            <Text style={styles.shopNowText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentCartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCartItem}
          contentContainerStyle={{ paddingBottom: currentCartItems.length > 0 ? 80 : 20 }}
        />
      )}
      {currentCartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => {
                navigation.navigate("Compare", { cartItems: currentCartItems });
            }}
          >
            <Text style={styles.compareButtonText}>Market Fiyatlarını Göster</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Stiller (bir öncekiyle aynı)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 15, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  emptyCartText: { textAlign: 'center', fontSize: 18, color: '#6c757d', marginBottom: 20 },
  cartItemContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 8, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  itemImage: { width: 70, height: 70, resizeMode: 'contain', marginRight: 15, borderRadius: 5 },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#343a40', marginBottom: 10 },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#e9ecef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5, borderWidth:1, borderColor: '#ced4da' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#495057' },
  quantityText: { fontSize: 16, fontWeight: '600', marginHorizontal: 15, color: '#343a40' },
  deleteButton: { padding: 10, marginLeft: 10 },
  deleteButtonText: { fontSize: 22, color: '#dc3545' },
  footer: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#f8f9fa' },
  compareButton: { backgroundColor: CUSTOM_GREEN_COLOR, paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  compareButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopNowText: { marginTop: 10, fontSize: 18, fontWeight: 'bold', color: CUSTOM_GREEN_COLOR, padding: 10 }
});