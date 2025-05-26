// screens/LocationPickerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator, Platform } from 'react-native'; // Platform eklendi (eğer başka bir yerde kullanılıyorsa)
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { CommonActions } from '@react-navigation/native';

export default function LocationPickerScreen({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [initialRegion, setInitialRegion] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    setLoadingAddress(true);
    try {
      const geocodedAddresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodedAddresses && geocodedAddresses.length > 0) {
        const firstAddress = geocodedAddresses[0];
        const addressString = [
          firstAddress.streetNumber,
          firstAddress.street,
          firstAddress.subregion,
          firstAddress.region,
          firstAddress.postalCode,
          firstAddress.country
        ].filter(Boolean).join(', ');
        setSelectedAddress(addressString);
      } else {
        setSelectedAddress('Adres bulunamadı.');
      }
    } catch (error) {
      setSelectedAddress('Adres alınırken hata oluştu.');
    }
    setLoadingAddress(false);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni Reddedildi', 'Harita özelliklerini kullanabilmek için konum izni gereklidir.');
        navigation.goBack();
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialRegion(region);
        setSelectedLocation(location.coords);
        await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        Alert.alert("Konum Hatası", "Mevcut konum alınamadı. Varsayılan bir konum haritada gösterilecek.");
        const fallbackRegion = { latitude: 37.00, longitude: 35.3213, latitudeDelta: 0.1, longitudeDelta: 0.1 };
        setInitialRegion(fallbackRegion);
        setSelectedLocation({ latitude: fallbackRegion.latitude, longitude: fallbackRegion.longitude });
        await getAddressFromCoordinates(fallbackRegion.latitude, fallbackRegion.longitude);
      }
    })();
  }, [navigation]);
  useEffect(() => {
  const blockBack = () => true;
  const subscription = BackHandler.addEventListener('hardwareBackPress', blockBack);
  return () => subscription.remove();
}, []);

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    await getAddressFromCoordinates(latitude, longitude);
  };

  const handleConfirmLocation = async () => {
  if (!selectedLocation) {
    Alert.alert('Konum Seçilmedi', 'Lütfen haritadan bir konum seçin.');
    return;
  }

  const locationInfoToSend = {
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    address: selectedAddress || 'Adres Belirtilmedi'
  };

  try {
    await AsyncStorage.setItem('selectedLocation', JSON.stringify(locationInfoToSend));
    console.log('Konum başarıyla kaydedildi:', locationInfoToSend);

    // Stack geçmişini sıfırla ve Home ekranına yönlendir
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            params: { selectedLocationInfo: locationInfoToSend }
          }
        ]
      })
    );
  } catch (error) {
    console.error('Konum kaydedilirken hata:', error);
    Alert.alert('Hata', 'Konum işlenirken bir sorun oluştu.');
  }
};

  return (
    <View style={styles.container}>
      {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} title="Seçilen Konum" description={selectedAddress} />}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005800" />
          <Text style={styles.loadingText}>Harita ve konum yükleniyor...</Text>
        </View>
      )}
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitleText}>Seçili Adres:</Text>
        {loadingAddress ? (
            <ActivityIndicator size="small" color="#005800" />
        ) : (
            <Text style={styles.addressText} numberOfLines={3}>{selectedAddress || "Lütfen haritadan bir konum seçin."}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Bu Konumu Kullan" onPress={handleConfirmLocation} color="#005800" disabled={loadingAddress || !selectedLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  addressContainer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  addressTitleText: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  addressText: { fontSize: 15, color: '#333', minHeight: 20 },
  buttonContainer: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
});