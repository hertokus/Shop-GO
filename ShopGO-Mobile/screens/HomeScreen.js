// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity, TextInput, ActivityIndicator, Platform, Button
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CUSTOM_GREEN_COLOR = '#005800';

// Varsayılan konum ve adres (kullanıcı konum seçmezse veya izin vermezse kullanılabilir)
const DEFAULT_LAT = 37.00; // Adana merkezi enlem (örnek)
const DEFAULT_LON = 35.3213; // Adana merkezi boylam (örnek)
const DEFAULT_ADDRESS = "Adana Merkezi (Varsayılan)";


export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // selectedLocationInfo artık { latitude, longitude, address } içerecek
  const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);

  useEffect(() => {
    navigation.setParams({ cartItemsForHeader: cartItems });
  }, [cartItems, navigation]);

  // LocationPickerScreen'den gelen seçili konumu ve adresi almak için useEffect
  useEffect(() => {
    // Gelen parametreyi konsola yazdır
    console.log('HomeScreen - route.params:', route.params);

    if (route.params?.selectedLocationInfo) {
      const { latitude, longitude, address } = route.params.selectedLocationInfo;
      console.log('HomeScreen - Received selectedLocationInfo:', { latitude, longitude, address });
      setSelectedLocationInfo({ latitude, longitude, address }); // Tüm bilgiyi state'e kaydet
      Alert.alert("Konum Güncellendi", address || `Enlem: ${latitude.toFixed(4)}, Boylam: ${longitude.toFixed(4)}`);
      // Parametreyi temizle, böylece ekran her odaklandığında tekrar alert göstermez
      navigation.setParams({ selectedLocationInfo: undefined });
    }
  }, [route.params?.selectedLocationInfo, navigation]);


  useEffect(() => {
    setLoading(true);
    fetch('http://192.168.1.14:5000/api/products')
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || `Sunucu hatası: ${res.status}`);
          }).catch(() => {
            throw new Error(`Sunucuya ulaşılamadı veya geçersiz yanıt: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          console.error("API'dan beklenen formatta array gelmedi:", data);
          setProducts([]);
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("API Hatası (HomeScreen - Ürünler):", error);
        Alert.alert("Hata", `Ürünler yüklenirken bir sorun oluştu: ${error.message}`);
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
        setSelectedCategory(item === selectedCategory ? null : item);
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
        <Image source={{ uri: item.image_url }} style={styles.productCardImage} onError={(e) => console.log("Resim yükleme hatası:", item.image_url, e.nativeEvent.error)} />
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

  const filteredByCategory = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  const searchedProducts = searchQuery
    ? filteredByCategory.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory;

  // CompareScreen'e giderken seçili konumu (sadece koordinatları) gönder
  const navigateToCompareScreen = () => {
    if (cartItems.length === 0) {
      Alert.alert("Sepet Boş", "Karşılaştırma yapmak için lütfen önce sepetinize ürün ekleyin.");
      return;
    }
    
    const locationForCompare = selectedLocationInfo
        ? { latitude: selectedLocationInfo.latitude, longitude: selectedLocationInfo.longitude }
        : { latitude: DEFAULT_LAT, longitude: DEFAULT_LON }; // Varsayılan koordinatlar

     if (!selectedLocationInfo) {
        Alert.alert("Konum Seçilmedi", `Varsayılan konum (${DEFAULT_ADDRESS}) kullanılacaktır. Daha doğru sonuçlar için konum seçebilirsiniz.`);
    }

    console.log('HomeScreen - Navigating to Compare with location:', locationForCompare);
    navigation.navigate("Compare", {
      cartItems,
      location: locationForCompare // CompareScreen sadece koordinatlara ihtiyaç duyar
    });
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      {/* Konum Seç Butonu */}
      <View style={styles.locationButtonContainer}>
        <TouchableOpacity
            style={styles.locationPickerButton}
            onPress={() => navigation.navigate("LocationPicker")}
        >
            <Text style={styles.locationPickerButtonText} numberOfLines={1} ellipsizeMode="tail">
                📍 {selectedLocationInfo?.address ? (selectedLocationInfo.address) : "Konum Seçin"}
            </Text>
        </TouchableOpacity>
      </View>


      {!loading && categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => item + index}
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
          contentContainerStyle={{ paddingBottom: cartItems.length > 0 ? 80 : 20 }} // Sepet varken butona yer aç
        />
      ) : (
        <Text style={styles.noProductsText}>
          {searchQuery && filteredByCategory.length > 0
            ? `"${searchQuery}" için ürün bulunamadı.`
            : selectedCategory
              ? `"${selectedCategory}" kategorisinde ürün bulunamadı.`
              : "Ürün bulunamadı."}
        </Text>
      )}

      {/* Sepet doluysa Market Fiyatlarını Göster butonu */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={navigateToCompareScreen}
          >
            <Text style={styles.compareButtonText}>Market Fiyatlarını Göster ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} ürün)</Text>
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
  },
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
  locationButtonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationPickerButton: { // Standart Button yerine TouchableOpacity kullandık
    backgroundColor: CUSTOM_GREEN_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center', // Metni ortalamak için
    justifyContent: 'center', // Metni ortalamak için
  },
  locationPickerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center', // Metnin kendisini de ortala
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
