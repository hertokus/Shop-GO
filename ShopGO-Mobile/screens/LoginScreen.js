// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://192.168.1.15:5000/api/login', {
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
      Alert.alert("Sunucu hatası", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
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
    flex: 1, flexDirection: 'row', backgroundColor: '#fff'
  },
  leftPanel: {
    flex: 1, backgroundColor: '#FEC601',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  logo: {
    width: 120, height: 120, resizeMode: 'contain', marginBottom: 20
  },
  leftTitle: {
    fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10
  },
  leftSubtitle: {
    fontSize: 16, textAlign: 'center', color: '#444'
  },
  rightPanel: {
    flex: 1, justifyContent: 'center',
    padding: 30, backgroundColor: '#fff'
  },
  formTitle: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#222'
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 15, fontSize: 16
  },
  loginButton: {
    backgroundColor: '#FEC601', padding: 14,
    borderRadius: 8, alignItems: 'center', marginBottom: 10
  },
  loginButtonText: {
    fontWeight: 'bold', fontSize: 16, color: '#333'
  },
  separator: {
    textAlign: 'center', marginVertical: 10, color: '#aaa'
  },
  googleButton: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8
  },
  googleIcon: {
    width: 24, height: 24, marginRight: 10
  },
  googleText: {
    fontSize: 16, color: '#333'
  }
});
