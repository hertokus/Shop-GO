// App.js
import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import CompareScreen from './screens/CompareScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const NEW_YELLOW_COLOR = '#ffe643';
const HEADER_TEXT_COLOR = '#333333';
const ICON_COLOR = '#333333';

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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          // HomeScreen'in cartItems'ını route.params aracılığıyla almak için options'a route ekliyoruz
          options={({ navigation, route }) => ({
            title: 'Shop&GO',
            headerRight: () => (
              <View style={styles.headerIconsContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Cart', { 
                    // HomeScreen'in setParams ile güncellediği cartItems'ı alıyoruz
                    cartItems: route.params?.cartItemsForHeader || [] 
                  })}
                  style={styles.headerIconTouchable}
                >
                  <Ionicons
                    name="cart-outline"
                    size={Platform.OS === 'ios' ? 28 : 26}
                    color={ICON_COLOR}
                  />
                  {/* İsteğe bağlı: Sepetteki ürün sayısını gösteren bir badge eklenebilir */}
                  {/* {route.params?.cartItemsForHeader && route.params.cartItemsForHeader.length > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{route.params.cartItemsForHeader.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                    </View>
                  )} */}
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
    position: 'relative', // Badge için
  },
  // Opsiyonel Badge Stilleri
  // badgeContainer: {
  //   position: 'absolute',
  //   right: 5,
  //   top: 0,
  //   backgroundColor: 'red',
  //   borderRadius: 9,
  //   width: 18,
  //   height: 18,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   zIndex: 1,
  // },
  // badgeText: {
  //   color: 'white',
  //   fontSize: 10,
  //   fontWeight: 'bold',
  // },
});
