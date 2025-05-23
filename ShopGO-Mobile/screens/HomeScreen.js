// screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity, TextInput, ActivityIndicator, Platform
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CUSTOM_GREEN_COLOR = '#005800';
// const YOUR_YELLOW_COLOR = '#ffe643'; // Bu sabit kullanılmıyorsa kaldırılabilir

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Kategori seçimi için
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    navigation.setParams({ cartItemsForHeader: cartItems });
  }, [cartItems, navigation]);

  useEffect(() => {
    setLoading(true); // Veri çekmeye başlarken yükleme durumunu true yap
    fetch('http://192.168.105.205:5000/api/products') // <<<--- DÜZELTİLDİ: "http://" eklendi
      .then(res => {
        if (!res.ok) {
          // Sunucudan gelen JSON formatındaki hata mesajını yakalamaya çalış
          return res.json().then(errData => {
            // errData.message varsa onu kullan, yoksa genel bir mesaj oluştur
            throw new Error(errData.message || `Sunucu hatası: ${res.status}`);
          }).catch(() => {
            // Eğer res.json() da hata verirse veya errData.message yoksa
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
          // Kategori listesi yüklendiğinde ve henüz bir kategori seçilmemişse ilk kategoriyi seç
          // Veya "Tümü" gibi bir seçenek ekleyip onu varsayılan yapabilirsiniz.
          if (uniqueCategories.length > 0 && !selectedCategory) {
             // setSelectedCategory(uniqueCategories[0]); // Otomatik ilk kategoriyi seçmek yerine null bırakılabilir.
             // Ya da bir "Tümü" seçeneği ekleyebilirsiniz:
             // setCategories(['Tümü', ...uniqueCategories]);
             // setSelectedCategory('Tümü');
          } else if (uniqueCategories.length === 0) {
            setSelectedCategory(null);
          }
        } else {
          console.error("API'dan beklenen formatta array gelmedi:", data);
          setProducts([]); // Hata durumunda ürünleri boşalt
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("API Hatası (HomeScreen - Ürünler):", error);
        Alert.alert("Hata", `Ürünler yüklenirken bir sorun oluştu: ${error.message}`);
        setProducts([]); // Hata durumunda ürünleri boşalt
        setCategories([]);
        setLoading(false);
      });
  }, []); // Boş bağımlılık dizisi, bu effect'in sadece bileşen mount olduğunda çalışmasını sağlar

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Çıkmak istiyor musun?', 'Uygulamadan çıkmak üzeresin.',
          [{ text: 'İptal', style: 'cancel' }, { text: 'Çık', onPress: () => BackHandler.exitApp() }]
        );
        return true; // Geri tuşu olayının ele alındığını belirtir
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove(); // Ekrandan çıkıldığında listener'ı kaldır
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
        // Miktar 1 ise veya ürün sepette değilse (bu durum handleIncrease ile eklenir genelde) ürünü sepetten çıkar
        return prevItems.filter(item => item.id !== product.id);
      }
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonSelected]}
      onPress={() => {
        setSelectedCategory(item === selectedCategory ? null : item); // Aynı kategoriye tekrar tıklanırsa seçimi kaldır
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

  // Filtreleme mantığı
  const filteredByCategory = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products; // Kategori seçili değilse tüm ürünler

  const searchedProducts = searchQuery
    ? filteredByCategory.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory; // Arama sorgusu yoksa kategoriye göre filtrelenmiş ürünler

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

      {!loading && categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories} // Tüm kategorileri listele
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => item + index} // Kategori isimleri unique olmalı, değilse index ile birleştir
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
          contentContainerStyle={{ paddingBottom: 20 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Daha yumuşak bir arka plan
  },
  searchContainer: {
    backgroundColor: '#fff', // Arama çubuğu için beyaz arka plan
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Hafif bir ayırıcı çizgi
  },
  searchInput: {
    backgroundColor: '#f0f0f0', // Arama inputu için hafif gri
    borderRadius: 20, // Daha yuvarlak kenarlar
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, // Platforma göre padding
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15, // Kategorilerin kenarlara yapışmaması için
    backgroundColor: '#fff', // Kategori şeridi için beyaz arka plan
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Yuvarlak butonlar
    backgroundColor: '#e9ecef', // Pasif kategori butonu rengi
    marginRight: 10, // Butonlar arası boşluk
    borderWidth: 1,
    borderColor: '#dee2e6', // Buton kenarlık rengi
  },
  categoryButtonSelected: {
    backgroundColor: CUSTOM_GREEN_COLOR, // Seçili kategori butonu rengi
    borderColor: CUSTOM_GREEN_COLOR, // Seçili kategori kenarlık rengi
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#495057', // Pasif kategori yazı rengi
  },
  categoryButtonTextSelected: {
    color: '#fff', // Seçili kategori yazı rengi
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
    color: '#6c757d' // Metin için daha yumuşak bir renk
  },
  row: {
    justifyContent: "space-around", // Kartlar arası boşluğu eşit dağıt
    paddingHorizontal: 10, // Kenar boşlukları
  },
  productCard: {
    flex: 1, // İki sütunlu düzende eşit genişlik almasını sağlar
    maxWidth: '48%', // Sütunlar arası boşluk için
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15, // Kartlar arası dikey boşluk
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.1, // Daha hafif bir gölge
    shadowRadius: 3.84,
    elevation: 5,
  },
  productCardImage: {
    width: 120, // Sabit genişlik
    height: 120, // Sabit yükseklik
    resizeMode: 'contain', // Resmin tamamını göster, oranları koru
    marginBottom: 10,
  },
  productCardName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 40, // İki satır metin için yeterli alan
    marginBottom: 5,
    color: '#343a40', // Koyu gri metin
  },
  productCardUnit: {
    fontSize: 13,
    color: '#6c757d', // Açık gri metin
    marginBottom: 10,
  },
  productCardButton: {
    backgroundColor: CUSTOM_GREEN_COLOR, // Ana renk
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '90%', // Kartın genişliğine göre ayarla
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
    justifyContent: 'space-between', // Butonları ve sayıyı yay
    width: '90%', // Kartın genişliğine göre ayarla
    marginTop: 8, // "Ekle" butonu yerine geldiğinde aynı boşluk
  },
  adjustButton: {
    backgroundColor: CUSTOM_GREEN_COLOR, // Ana renk
    width: 36, // Buton boyutu
    height: 36, // Buton boyutu
    borderRadius: 18, // Tamamen yuvarlak buton
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: Platform.OS === 'ios' ? 22 : 24, // iOS için dikey hizalama
  },
  quantityDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30, // Sayı için minimum genişlik
    textAlign: 'center',
  },
});