// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity, TextInput, ActivityIndicator, Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect zaten import edilmiş
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (sabitler ve Android LayoutAnimation ayarı aynı) ...
const CUSTOM_GREEN_COLOR = '#005800';
const YOUR_YELLOW_COLOR = '#ffe643';
const TEXT_COLOR_DARK = '#333333';
const WHITE_COLOR = '#ffffff';
const DEFAULT_LAT = 37.00;
const DEFAULT_LON = 35.3213;
const DEFAULT_ADDRESS = "Adana Merkezi (Varsayılan)";
const CART_STORAGE_KEY = 'userShopGoCartItems';
const LOCATION_STORAGE_KEY = 'selectedShopGoLocation';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true); // Ürünler için ayrı loading
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false); // Genel ilk yükleme

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);
  const [footerHeight, setFooterHeight] = useState(0);

  // 1. Sadece bir kez çalışan: Kayıtlı konumu yükle ve ürünleri çek
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const savedLocationString = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (savedLocationString) {
          const savedLocation = JSON.parse(savedLocationString);
          if (savedLocation) {
            setSelectedLocationInfo(savedLocation);
          }
        }
      } catch (error) {
        console.error("HomeScreen - AsyncStorage'dan konum okunurken hata:", error);
      }
    };

    const fetchProducts = () => {
        setLoadingProducts(true);
        fetch('http://192.168.1.11:5000/api/products')
            .then(res => { /* ... (hata yönetimi aynı) ... */
                if (!res.ok) { return res.json().then(err => { throw err; }); } return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) { setProducts(data); const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]; setCategories(uniqueCategories); }
                else { setProducts([]); setCategories([]); }
            })
            .catch(error => { console.error("API Hatası (HomeScreen - Ürünler):", error); Alert.alert("Hata", `Ürünler yüklenirken bir sorun oluştu.`); setProducts([]); setCategories([]); })
            .finally(() => setLoadingProducts(false));
    };

    loadSavedLocation();
    fetchProducts();
    setIsInitialDataLoaded(true); // Diğer effect'lerin çalışabilmesi için
  }, []);

  // 2. HomeScreen her odaklandığında (focus olduğunda) AsyncStorage'dan sepeti yükle
  useFocusEffect(
    useCallback(() => {
      const loadCartFromStorage = async () => {
        try {
          const savedCartString = await AsyncStorage.getItem(CART_STORAGE_KEY);
          if (savedCartString) {
            const savedCart = JSON.parse(savedCartString);
            if (Array.isArray(savedCart)) {
              setCartItems(savedCart);
              console.log('HomeScreen (focus) - Sepet AsyncStorage dan yüklendi:', savedCart);
            } else {
              setCartItems([]); // Geçersiz veri varsa boşalt
            }
          } else {
            setCartItems([]); // Kayıtlı sepet yoksa boşalt
            console.log('HomeScreen (focus) - AsyncStorage da kayıtlı sepet bulunamadı.');
          }
        } catch (error) {
          console.error("HomeScreen (focus) - AsyncStorage'dan sepet okunurken hata:", error);
          setCartItems([]); // Hata durumunda boşalt
        }
      };

      loadCartFromStorage();
      // Bu effect'ten bir cleanup fonksiyonu döndürmeye gerek yok,
      // çünkü sadece focus olduğunda çalışıyor.
    }, []) // Boş bağımlılık, her focus'ta çalışır
  );


  // 3. Sepet değiştiğinde AsyncStorage'a kaydet (Bu zaten vardı, isInitialDataLoaded kontrolü önemli)
  useEffect(() => {
    if (isInitialDataLoaded) {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
          console.log('HomeScreen - Sepet AsyncStorage a kaydedildi (değişiklik sonrası):', cartItems);
        } catch (error) {
          console.error("HomeScreen - Sepet AsyncStorage'a kaydedilirken hata:", error);
        }
      };
      saveCart();
    }
  }, [cartItems, isInitialDataLoaded]);

  // 4. Header'daki sepet ikonunu güncelle (Bu aynı kalabilir)
  useEffect(() => {
    navigation.setParams({ cartItemsForHeader: cartItems });
  }, [cartItems, navigation]);

  // 5. LocationPickerScreen'dan gelen YENİ konumu işle (Eskisi gibi, sadece AsyncStorage'a kaydı zaten yapılıyor)
  useEffect(() => {
    if (route.params?.selectedLocationInfo) {
      const newLocInfo = route.params.selectedLocationInfo;
      // selectedLocationInfo AsyncStorage'a LocationPickerScreen'de zaten kaydediliyor.
      // Sadece state'i güncelliyoruz ve kullanıcıyı bilgilendiriyoruz.
      if (JSON.stringify(selectedLocationInfo) !== JSON.stringify(newLocInfo)) {
          setSelectedLocationInfo(newLocInfo);
          Alert.alert("Konum Güncellendi", newLocInfo.address || `Enlem: ${newLocInfo.latitude.toFixed(4)}, Boylam: ${newLocInfo.longitude.toFixed(4)}`);
      }
      navigation.setParams({ selectedLocationInfo: undefined }); // Parametreyi temizle
    }
  }, [route.params?.selectedLocationInfo, navigation, selectedLocationInfo]);


  // useFocusEffect (BackHandler için) ve diğer tüm render/handler fonksiyonları aynı kalacak
  // ... (handleIncreaseQuantity, handleDecreaseQuantity, renderCategoryItem, renderProductCard, vs.)
  // ... (return JSX kısmı ve stiller aynı kalacak)
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
    const fullProductInfo = products.find(p => p.id === product.id) || product;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === fullProductInfo.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === fullProductInfo.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...fullProductInfo, quantity: 1 }];
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
        LayoutAnimation.configureNext({
          duration: 300, create: {type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity,},
          update: {type: LayoutAnimation.Types.easeInEaseOut,}, delete: {type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity,}
        });
        setSelectedCategory(item === selectedCategory ? null : item);
      }}
    >
      <Text style={[styles.categoryButtonText, selectedCategory === item && styles.categoryButtonTextSelected]}>{item}</Text>
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
            <TouchableOpacity style={styles.adjustButton} onPress={() => handleDecreaseQuantity(item)}><Text style={styles.adjustButtonText}>-</Text></TouchableOpacity>
            <Text style={styles.quantityDisplay}>{quantityInCart}</Text>
            <TouchableOpacity style={styles.adjustButton} onPress={() => handleIncreaseQuantity(item)}><Text style={styles.adjustButtonText}>+</Text></TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.productCardButton} onPress={() => handleIncreaseQuantity(item)}><Text style={styles.productCardButtonText}>Ekle</Text></TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredByCategory = selectedCategory ? products.filter(product => product.category === selectedCategory) : products;
  const searchedProducts = searchQuery ? filteredByCategory.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase())) : filteredByCategory;

  if (loadingProducts || !isInitialDataLoaded) {
    return (
      <View style={[styles.container, styles.loadingIndicatorFullPage]}>
        <ActivityIndicator size="large" color={CUSTOM_GREEN_COLOR} />
        <Text style={styles.loadingFullPageText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Ürün ara..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#888"/>
      </View>
      <View style={styles.locationSectionContainer}>
        <TouchableOpacity style={styles.locationChipButton} onPress={() => navigation.navigate("LocationPicker")}>
          <Ionicons name="location-outline" size={20} color={CUSTOM_GREEN_COLOR} style={styles.locationChipIcon} />
          <Text style={styles.locationChipText} numberOfLines={1} ellipsizeMode="tail">
            {selectedLocationInfo?.address ? selectedLocationInfo.address : "Konum Seçin"}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color={CUSTOM_GREEN_COLOR} style={styles.locationChipIcon} />
        </TouchableOpacity>
      </View>
      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList data={categories} renderItem={renderCategoryItem} keyExtractor={(item, index) => item + index} horizontal showsHorizontalScrollIndicator={false}/>
        </View>
      )}
      {searchedProducts.length > 0 ? (
        <FlatList data={searchedProducts} keyExtractor={(item) => item.id.toString()} numColumns={2} renderItem={renderProductCard} columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: cartItems.length > 0 ? (footerHeight > 0 ? footerHeight + 10 : 90) : 20 }}/>
      ) : (
        <Text style={styles.noProductsText}>
          {searchQuery && filteredByCategory.length > 0 ? `"${searchQuery}" için ürün bulunamadı.` : selectedCategory ? `"${selectedCategory}" kategorisinde ürün bulunamadı.` : "Uygun ürün bulunamadı."}
        </Text>
      )}
      {cartItems.length > 0 && (
        <View
          style={styles.footer}
          onLayout={(event) => { // Bu onLayout kısmı footer yüksekliğini ayarlamak için kalabilir
            const { height } = event.nativeEvent.layout;
            if (height > 0 && height !== footerHeight) {
                setFooterHeight(height);
            }
          }}
        >
          <TouchableOpacity
            style={styles.footerActionButton}
            onPress={() => navigation.navigate('Cart', { cartItems: cartItems })}
          >
            
            <Text style={styles.footerActionButtonText}>Sepete Git</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Stiller... (bir öncekiyle aynı)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa'},
  loadingIndicatorFullPage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingFullPageText: { marginTop: 10, fontSize: 16, color: TEXT_COLOR_DARK },
  searchContainer: { backgroundColor: WHITE_COLOR, paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee'},
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 16, color: TEXT_COLOR_DARK},
  locationSectionContainer: { paddingVertical: 12, backgroundColor: WHITE_COLOR, paddingHorizontal: 15 },
  locationChipButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE_COLOR, borderColor: CUSTOM_GREEN_COLOR, borderWidth: 1.5, borderRadius: 25, paddingVertical: 10, paddingHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2, width: '100%'},
  locationChipIcon: { marginHorizontal: 4 },
  locationChipText: { fontSize: 14, fontWeight: '600', color: CUSTOM_GREEN_COLOR, textAlign: 'center', marginHorizontal: 8, flex: 1 },
  categoryContainer: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: WHITE_COLOR, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e9ecef', marginRight: 10, borderWidth: 1, borderColor: '#dee2e6' },
  categoryButtonSelected: { backgroundColor: CUSTOM_GREEN_COLOR, borderColor: CUSTOM_GREEN_COLOR },
  categoryButtonText: { fontSize: 14, color: '#495057' },
  categoryButtonTextSelected: { color: WHITE_COLOR, fontWeight: 'bold' },
  // loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // loadingIndicatorFullPage kullanılıyor
  noProductsText: { textAlign: 'center', marginTop: 30, paddingHorizontal:20, fontSize: 16, color: '#6c757d' },
  row: { justifyContent: "space-around", paddingHorizontal: 10 },
  productCard: { flex: 1, maxWidth: '48%', backgroundColor: WHITE_COLOR, borderRadius: 8, padding: 12, marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  productCardImage: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 10 },
  productCardName: { fontSize: 15, fontWeight: '600', textAlign: 'center', minHeight: 40, marginBottom: 5, color: '#343a40' },
  productCardUnit: { fontSize: 13, color: '#6c757d', marginBottom: 10 },
  productCardButton: { backgroundColor: CUSTOM_GREEN_COLOR, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, width: '90%', alignItems: 'center' },
  productCardButtonText: { color: WHITE_COLOR, fontWeight: 'bold', fontSize: 14 },
  quantityAdjuster: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', marginTop: 8 },
  adjustButton: { backgroundColor: CUSTOM_GREEN_COLOR, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  adjustButtonText: { color: WHITE_COLOR, fontSize: 20, fontWeight: 'bold', lineHeight: Platform.OS === 'ios' ? 22 : 24 },
  quantityDisplay: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR_DARK, minWidth: 30, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: WHITE_COLOR, borderTopWidth: 1, borderTopColor: '#eee' },
  footerActionButton: { backgroundColor: CUSTOM_GREEN_COLOR, paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  footerActionButtonText: { color: WHITE_COLOR, fontSize: 16, fontWeight: 'bold' }
});