// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUR_NEW_YELLOW_COLOR = '#ffe643';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://192.168.105.205:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('accessToken', data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify({
          username: data.username,
          fullName: data.fullName
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
      <View style={styles.topPanel}>
        <Image source={require('../assets/logo shopandgo.png')} style={styles.logo} />
      </View>

      <View style={styles.bottomPanel}>
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
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  topPanel: {
    flex: 0.4,
    backgroundColor: YOUR_NEW_YELLOW_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  logo: {
    width: 220, // Daha da büyük logo
    height: 220, // Daha da büyük logo
    resizeMode: 'contain',
  },
  bottomPanel: {
    flex: 0.6,
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff'
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  loginButton: {
    backgroundColor: YOUR_NEW_YELLOW_COLOR,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
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
    color: '#333'
  },
  separator: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#aaa',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  googleText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  }
});