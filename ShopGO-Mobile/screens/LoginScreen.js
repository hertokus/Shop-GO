// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUR_NEW_YELLOW_COLOR = '#ffe643'; // Sizin yeni sarı tonunuz

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // API IP adresinizi kontrol edin ve gerekiyorsa güncelleyin
      const res = await fetch('http://192.168.1.11:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('accessToken', data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify({
          username: data.username,
          fullName: data.fullName // Backend'den fullName geliyorsa
        }));
        navigation.replace("Home");
      } else {
        Alert.alert("Giriş Hatası", data.message || "Bilgiler yanlış.");
      }
    } catch (e) {
      Alert.alert("Sunucu hatası", e.message || "Bir şeyler ters gitti, lütfen tekrar deneyin.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        {/* Logo dosya yolunuzu kontrol edin: '../assets/logo shopandgo.png' */}
        <Image source={require('../assets/logo shopandgo.png')} style={styles.logo} />
        <Text style={styles.leftTitle}>Tekrar Hoş Geldiniz!</Text>
        <Text style={styles.leftSubtitle}>Uygun alışverişin adresi...</Text>
      </View>

      <View style={styles.rightPanel}>
        <Text style={styles.formTitle}>Giriş Yap</Text>

        <TextInput
          placeholder="E-posta"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Şifre"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>VEYA</Text>

        <TouchableOpacity style={styles.googleButton}>
          <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={styles.googleIcon} />
          <Text style={styles.googleText}>Google ile Devam Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Yatay düzen için
    backgroundColor: '#fff'
  },
  leftPanel: {
    flex: 1, // Sol panel ekranın yarısını kaplar
    backgroundColor: YOUR_NEW_YELLOW_COLOR, // Güncellenmiş sarı renk
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20
  },
  leftTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Sarı arka plan üzerinde koyu renk daha iyi okunur
    marginBottom: 10,
    textAlign: 'center',
  },
  leftSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444' // Sarı arka plan üzerinde koyu renk
  },
  rightPanel: {
    flex: 1, // Sağ panel ekranın yarısını kaplar
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff' // Sağ panel beyaz kalabilir veya farklı bir renk olabilir
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25, // Biraz daha boşluk
    color: '#222',
    textAlign: 'center', // Başlığı ortala
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd', // Daha yumuşak bir border rengi
    borderRadius: 8,
    paddingHorizontal: 15, // İçten yatay boşluk
    paddingVertical: 12, // İçten dikey boşluk
    marginBottom: 18, // Inputlar arası boşluk
    fontSize: 16,
    backgroundColor: '#f9f9f9' // Hafif bir arka plan rengi (opsiyonel)
  },
  loginButton: {
    backgroundColor: YOUR_NEW_YELLOW_COLOR, // Güncellenmiş sarı renk
    paddingVertical: 15, // Dikey padding'i artır
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15, // Buton altı boşluk
    shadowColor: "#000", // Hafif gölge (opsiyonel)
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  loginButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333' // Sarı buton üzerinde koyu renk yazı
  },
  separator: {
    textAlign: 'center',
    marginVertical: 15, // Ayırıcı için dikey boşluk
    color: '#aaa',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // İçeriği ortala
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12, // Dikey padding
    borderRadius: 8,
    backgroundColor: '#fff' // Google butonu genellikle beyazdır
  },
  googleIcon: {
    width: 22, // Biraz daha küçük ikon
    height: 22,
    marginRight: 12, // İkon ve yazı arası boşluk
  },
  googleText: {
    fontSize: 16,
    color: '#555', // Google butonu yazı rengi
    fontWeight: '500',
  }
});