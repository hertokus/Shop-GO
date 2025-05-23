// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity, TextInput, ActivityIndicator, Platform
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// AsyncStorage artık burada doğrudan kullanılmıyor, kaldırılabilir
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

const CUSTOM_GREEN_COLOR = '#005800';
const YOUR_YELLOW_COLOR = '#ffe643';

export default function HomeScreen({ navigation }) { // navigation prop'u burada
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // cartItems her değiştiğinde, bu bilgiyi route parametrelerine ekle
  // Böylece App.js'deki headerRight bu bilgiye erişebilir
  useEffect(() => {
    navigation.setParams({ cartItemsForHeader: cartItems });
  }, [cartItems, navigation]);

  useEffect(() => {
    fetch('http://192.168.105.194:5000/api/products') // KENDİ IP ADRESİNİZİ KULLANIN
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || `Sunucu hatası: ${res.status}`);
          }).catch(() => {
            throw new Error(`Sunucu hatası: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
          if (uniqueCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(uniqueCategories[0]);
          } else if (uniqueCategories.length === 0) {
            setSelectedCategory(null);
          }
        } else {
          console.error("API'dan beklenen formatta array gelmedi:", data);
          setProducts([]);
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("API Hatası (HomeScreen - Ürünler):", error);
        Alert.alert("Hata", error.message || "Ürünler yüklenirken bir sorun oluştu.");
        setProducts([]);
        setCategories([]);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Çıkmak istiyor musun?', 'Uygulamadan çıkmak üzeresin.',
          [{ text: 'İptal', style: 'cancel' }, { text: 'Çık', onPress: () => BackHandler.exitApp() }]
        );
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleIncreaseQuantity = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const handleDecreaseQuantity = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevItems.filter(item => item.id !== product.id);
      }
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonSelected]}
      onPress={() => {
        setSelectedCategory(item);
      }}
    >
      <Text style={[styles.categoryButtonText, selectedCategory === item && styles.categoryButtonTextSelected]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }) => {
    const cartItem = cartItems.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.image_url }} style={styles.productCardImage} />
        <Text style={styles.productCardName} numberOfLines={2}>{item.name}</Text>
        {item.unit && <Text style={styles.productCardUnit}>{item.unit}</Text>}
        {quantityInCart > 0 ? (
          <View style={styles.quantityAdjuster}>
            <TouchableOpacity style={styles.adjustButton} onPress={() => handleDecreaseQuantity(item)}>
              <Text style={styles.adjustButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityDisplay}>{quantityInCart}</Text>
            <TouchableOpacity style={styles.adjustButton} onPress={() => handleIncreaseQuantity(item)}>
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.productCardButton}
            onPress={() => handleIncreaseQuantity(item)}
          >
            <Text style={styles.productCardButtonText}>Ekle</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const categoryFilteredProducts = !selectedCategory
    ? products
    : products.filter(product => product.category === selectedCategory);

  const searchedProducts = searchQuery
    ? categoryFilteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFilteredProducts;

  return (
    <View style={styles.container}>
      {/* HomeScreen içindeki header, React Navigation header'ı kullanılıyorsa gereksiz olabilir */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Shop&GO</Text>
      </View> */}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      {!loading && categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={CUSTOM_GREEN_COLOR} style={styles.loadingIndicator} />
      ) : searchedProducts.length > 0 ? (
        <FlatList
          data={searchedProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderProductCard}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }} // Footer olmadığı için padding azaltıldı
        />
      ) : (
        <Text style={styles.noProductsText}>
          {searchQuery && categoryFilteredProducts.length > 0
            ? `"${searchQuery}" için ürün bulunamadı.`
            : selectedCategory
              ? `"${selectedCategory}" kategorisinde ürün bulunamadı.`
              : "Ürün bulunamadı."}
        </Text>
      )}
      
      {/* Footer ve "Listeyi Gör" Butonu buradan tamamen kaldırıldı */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // HomeScreen içindeki header stili, App.js'deki header kullanılıyorsa kaldırılabilir.
  // header: { 
  //   flexDirection: 'row',
  //   justifyContent: 'center', 
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  //   paddingTop: Platform.OS === 'android' ? 20 : 40, 
  //   paddingBottom: 10,
  //   backgroundColor: '#fff',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#eee',
  // },
  // title: { 
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   color: '#333',
  // },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryButtonSelected: {
    backgroundColor: CUSTOM_GREEN_COLOR,
    borderColor: CUSTOM_GREEN_COLOR,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal:20,
    fontSize: 16,
    color: '#6c757d'
  },
  row: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productCardImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productCardName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 40,
    marginBottom: 5,
    color: '#343a40',
  },
  productCardUnit: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 10,
  },
  productCardButton: {
    backgroundColor: CUSTOM_GREEN_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
  },
  productCardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quantityAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 8,
  },
  adjustButton: {
    backgroundColor: CUSTOM_GREEN_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: Platform.OS === 'ios' ? 22 : 24,
  },
  quantityDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  // footer, viewCartButton, viewCartButtonText stilleri kaldırıldı.
});
