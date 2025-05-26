// App.js
import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Text } from 'react-native'; // Text import edildi
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Ekranlarınızın importları (bunlar aynı kalacak)
import LocationPickerScreen from './screens/LocationPickerScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import CompareScreen from './screens/CompareScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const NEW_YELLOW_COLOR = '#ffe643';
const HEADER_TEXT_COLOR = '#333333';
const ICON_COLOR = '#333333';
const BADGE_BACKGROUND_COLOR = 'red'; // Badge için renk
const BADGE_TEXT_COLOR = 'white';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: NEW_YELLOW_COLOR,
          },
          headerTintColor: HEADER_TEXT_COLOR,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ title: 'Konum Seç' }} />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ title: 'Kayıt Ol' }}
        />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{ title: 'Şifremi Unuttum' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation, route }) => {
            // Sepetteki toplam ürün sayısını hesapla (her ürünün kendi miktarını toplayarak)
            const cartTotalQuantity =
              route.params?.cartItemsForHeader?.reduce(
                (sum, item) => sum + (item.quantity || 0), // Her ürünün miktarını topla
                0
              ) || 0;

            return {
              title: 'Shop&GO',
              headerRight: () => (
                <View style={styles.headerIconsContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Cart', {
                      cartItems: route.params?.cartItemsForHeader || []
                    })}
                    style={styles.headerIconTouchable} // Bu stilin position: 'relative' olması önemli
                  >
                    <Ionicons
                      name="cart-outline"
                      size={Platform.OS === 'ios' ? 28 : 26}
                      color={ICON_COLOR}
                    />
                    {/* Ürün sayısı 0'dan büyükse badge'i göster */}
                    {cartTotalQuantity > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{cartTotalQuantity}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.headerIconTouchable}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={Platform.OS === 'ios' ? 32 : 30}
                      color={ICON_COLOR}
                    />
                  </TouchableOpacity>
                </View>
              ),
            };
          }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            // headerLeft: () => null, // Geri butonunu gizlemek isterseniz
            headerTitle: 'Alışveriş Listem',
            // headerBackVisible: false, // Geri okunu tamamen gizler
          }}
        />
        <Stack.Screen
          name="Compare"
          component={CompareScreen}
          options={{ title: 'Market Karşılaştırma' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profilim' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Platform.OS === 'ios' ? 0 : 5,
  },
  headerIconTouchable: {
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 12, // İkonlar arası boşluğu artırabiliriz
    paddingVertical: 5,
    position: 'relative', // Badge'in doğru konumlanması için GEREKLİ
  },
  // YENİ STİLLER (Badge için)
  badgeContainer: {
    position: 'absolute',
    right: 5,  // İkonun sağ üst köşesine göre konumlandırma
    top: 2,    // İkonun sağ üst köşesine göre konumlandırma
    backgroundColor: BADGE_BACKGROUND_COLOR, // Genellikle kırmızı olur
    borderRadius: 9,       // Tam yuvarlak olması için (width/height yarısı)
    width: 18,             // Badge genişliği
    height: 18,            // Badge yüksekliği
    justifyContent: 'center', // Sayıyı ortalamak için
    alignItems: 'center',     // Sayıyı ortalamak için
    zIndex: 1, // Diğer elemanların üzerinde görünmesi için
  },
  badgeText: {
    color: BADGE_TEXT_COLOR, // Beyaz
    fontSize: 10,          // Küçük font
    fontWeight: 'bold',
  },
});