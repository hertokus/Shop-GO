// screens/LocationPickerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationPickerScreen({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(''); // Seçilen adres metni için state
  const [initialRegion, setInitialRegion] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false); // Adres yüklenirken gösterilecek indicator için

  const getAddressFromCoordinates = async (latitude, longitude) => {
    setLoadingAddress(true);
    try {
      const geocodedAddresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodedAddresses && geocodedAddresses.length > 0) {
        const firstAddress = geocodedAddresses[0];
        // Adres formatını isteğinize göre düzenleyebilirsiniz
        const addressString = [
          firstAddress.streetNumber,
          firstAddress.street,
          firstAddress.subregion, // İlçe
          firstAddress.region,    // İl
          // firstAddress.city, // Bazen region ile aynı olabilir, duruma göre kullanın
          firstAddress.postalCode,
          firstAddress.country
        ].filter(Boolean).join(', '); // null veya undefined olanları filtrele ve aralarına virgül koy
        setSelectedAddress(addressString);
        console.log('LocationPickerScreen - Fetched Address:', addressString); // Log güncellendi
      } else {
        setSelectedAddress('Adres bulunamadı.');
        console.log('LocationPickerScreen - Address not found for coords:', latitude, longitude);
      }
    } catch (error) {
      console.error("LocationPickerScreen - Reverse geocoding error:", error);
      setSelectedAddress('Adres alınırken hata oluştu.');
    }
    setLoadingAddress(false);
  };

  useEffect(() => {
    console.log("LocationPickerScreen: useEffect for initial location mounting.");
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni Reddedildi', 'Harita özelliklerini kullanabilmek için konum izni gereklidir.');
        navigation.goBack(); // İzin yoksa geri dön
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01, // Daha yakın bir zoom seviyesi
          longitudeDelta: 0.01,
        };
        setInitialRegion(region);
        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setSelectedLocation(currentCoords);
        console.log("LocationPickerScreen: Initial current location set:", currentCoords);
        // Başlangıç konumu için adresi al
        await getAddressFromCoordinates(currentCoords.latitude, currentCoords.longitude);
      } catch (error) {
          console.error("LocationPickerScreen - Error getting current location:", error);
          Alert.alert("Konum Hatası", "Mevcut konum alınamadı. Varsayılan konum (Adana Merkezi) kullanılacak. Haritadan değiştirebilirsiniz.");
          const adanaRegion = {
            latitude: 37.00, // Adana
            longitude: 35.3213, // Adana
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          };
          setInitialRegion(adanaRegion); // Harita Adana'yı gösterecek
          const defaultCoords = {
            latitude: adanaRegion.latitude,
            longitude: adanaRegion.longitude,
          };
          setSelectedLocation(defaultCoords); // Varsayılan konumu seçili yap
          console.log("LocationPickerScreen: Default location set due to error:", defaultCoords);
          // Varsayılan konum için adresi al
          await getAddressFromCoordinates(defaultCoords.latitude, defaultCoords.longitude);
      }
    })();
  }, []); // Bağımlılık dizisi [] olarak değiştirildi, sadece mount edildiğinde çalışması için.

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('LocationPickerScreen - Map pressed at:', { latitude, longitude });
    setSelectedLocation({ latitude, longitude });
    // Haritadan seçilen yeni konum için adresi al
    await getAddressFromCoordinates(latitude, longitude);
  };

  const handleConfirmLocation = async () => {
  if (!selectedLocation) {
    Alert.alert('Konum Seçilmedi', 'Lütfen haritadan bir konum seçin veya varsayılan konumu kullanın.');
    return;
  }

  const locationInfoToSend = {
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    address: selectedAddress || 'Adres belirtilmedi'
  };

  try {
    // ✅ AsyncStorage'a kaydet
    await AsyncStorage.setItem('selectedLocation', JSON.stringify(locationInfoToSend));
    console.log('Konum başarıyla AsyncStorage\'a kaydedildi:', locationInfoToSend);

    // ✅ Home ekranına yönlendir
    navigation.navigate('Home', {
      selectedLocationInfo: locationInfoToSend
    });
  } catch (error) {
    console.error('Konum kaydedilirken hata:', error);
    Alert.alert('Hata', 'Konum kaydedilemedi, lütfen tekrar deneyin.');
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
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5'
  },
  map: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  addressContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  addressTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    minHeight: 20,
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
