import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

const CUSTOM_GREEN_COLOR = '#005800'; // İstediğiniz yeşil renk

export default function CartScreen({ route, navigation }) {
  const [currentCartItems, setCurrentCartItems] = useState([]);

  useEffect(() => {
    const initialCartItems = (route.params?.cartItems || []).map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));
    setCurrentCartItems(initialCartItems);
  }, [route.params?.cartItems]);

  const handleIncreaseQuantity = (itemId) => {
    setCurrentCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setCurrentCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.id !== itemId || item.quantity > 0)
    );
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

  // Liste özeti fonksiyonları kaldırıldı: calculateTotalUniqueItems, calculateTotalQuantity

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
        <Text style={styles.emptyCartText}>Listenizde henüz ürün bulunmuyor.</Text>
      ) : (
        // Liste özeti JSX bölümü buradan kaldırıldı
        <FlatList
          data={currentCartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCartItem}
          contentContainerStyle={{ paddingBottom: 20 }} // Listenin altına biraz boşluk
        />
      )}

      {currentCartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => navigation.navigate("Compare", { cartItems: currentCartItems })}
          >
            <Text style={styles.compareButtonText}>Market Fiyatlarını Göster</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  emptyCartText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 50,
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 15,
    borderRadius: 5,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth:1,
    borderColor: '#ced4da'
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#343a40',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 22,
    color: '#dc3545',
  },
  // summaryContainer ve içindeki stiller (summaryTitle, summaryRow, summaryText, summaryValue) kaldırıldı.
  footer: {
    paddingVertical: 10,
     // Eğer footer'ı sayfanın altına sabitlemek isterseniz:
    // position: 'absolute',
    // bottom: 0,
    // left: 15, // container paddingHorizontal ile eşleşmeli
    // right: 15, // container paddingHorizontal ile eşleşmeli
    // backgroundColor: '#f8f9fa', // Arka plan rengiyle uyumlu
  },
  compareButton: {
    backgroundColor: CUSTOM_GREEN_COLOR,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});