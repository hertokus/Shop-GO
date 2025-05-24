// App.js - Splash screen değişiklikleri geri alındı
import React from 'react'; // useEffect, useState, useCallback kaldırıldı (eğer sadece splash için eklendiyse)
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
// import * as SplashScreen from 'expo-splash-screen'; // <-- BU SATIRI SİLİN

// Ekranlarınızın importları
import LocationPickerScreen from './screens/LocationPickerScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import CompareScreen from './screens/CompareScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';

// SplashScreen.preventAutoHideAsync(); // <-- BU SATIRI SİLİN

const Stack = createNativeStackNavigator();
const NEW_YELLOW_COLOR = '#ffe643';
const HEADER_TEXT_COLOR = '#333333';
const ICON_COLOR = '#333333';

export default function App() {
  // const [appIsReady, setAppIsReady] = useState(false); // <-- BU SATIRI SİLİN
  // useEffect(() => { /* ... prepareApp ... */ }, []); // <-- BU useEffect BLOĞUNU SİLİN
  // const onLayoutRootView = useCallback(async () => { /* ... hideAsync ... */ }, [appIsReady]); // <-- BU FONKSİYONU SİLİN
  // if (!appIsReady) { return null; } // <-- BU KONTROLÜ SİLİN

  return (
    // <View style={{ flex: 1 }} onLayout={onLayoutRootView}> // Bu View sarmalayıcısını kaldırın
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
          name="Home"
          component={HomeScreen}
          options={({ navigation, route }) => ({
            title: 'Shop&GO',
            headerRight: () => (
              <View style={styles.headerIconsContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Cart', {
                    cartItems: route.params?.cartItemsForHeader || []
                  })}
                  style={styles.headerIconTouchable}
                >
                  <Ionicons
                    name="cart-outline"
                    size={Platform.OS === 'ios' ? 28 : 26}
                    color={ICON_COLOR}
                  />
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
          })}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Alışveriş Listem' }}
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
    // </View> // Kök View sarmalayıcısı kaldırıldıysa bu da kaldırılmalı
  );
}

const styles = StyleSheet.create({
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Platform.OS === 'ios' ? 0 : 5,
  },
  headerIconTouchable: {
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 10,
    paddingVertical: 5,
    position: 'relative',
  },
});