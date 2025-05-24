// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert,
  KeyboardAvoidingView, // Eklendi
  ScrollView,         // Eklendi
  Platform            // Eklendi
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUR_NEW_YELLOW_COLOR = '#ffe643';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // IP adresinizi güncellediğinizden emin olun: '192.168.1.11:5000' yerine kendi IP'niz
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

  const handleSignUpNavigation = () => {
    navigation.navigate('SignUpScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Gerekirse header yüksekliği kadar offset eklenebilir
    >
      <View style={styles.topPanel}>
        <Image source={require('../assets/splash_logo.png')} style={styles.logo} />
      </View>

      {/* Alt Panel: Giriş Formu artık ScrollView içinde */}
      <View style={styles.bottomPanelContainer}>
        <ScrollView
          contentContainerStyle={styles.bottomPanelContentContainer}
          keyboardShouldPersistTaps="handled" // Klavye açıkken butonlara tıklanabilmesi için
          showsVerticalScrollIndicator={false} // Kaydırma çubuğunu gizle (isteğe bağlı)
        >
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

          <View style={styles.signUpContainer}>
            <Text style={styles.noAccountText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={handleSignUpNavigation}>
              <Text style={styles.signUpLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.separator}>VEYA</Text>

          <TouchableOpacity style={styles.googleButton}>
            <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={styles.googleIcon} />
            <Text style={styles.googleText}>Google ile Devam Et</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Eski 'container' stili KeyboardAvoidingView'e uygulandı ve adı değişti
  keyboardAvoidingContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff' // Arka plan rengini koru
  },
  topPanel: {
    flex: 0.4,
    backgroundColor: YOUR_NEW_YELLOW_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  // bottomPanel artık ScrollView için bir container görevi görüyor
  bottomPanelContainer: {
    flex: 0.6, // Yüksekliği ayarlayabilirsiniz
    backgroundColor: '#fff', // Arka plan rengini koru
  },
  // ScrollView'in içeriği için padding ve diğer ayarlar
  bottomPanelContentContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20, // ScrollView sonunda boşluk olması için
    // alignItems: 'center', // Eğer içerik (form elemanları) ortalanacaksa. Mevcut durumda inputlar zaten %100 genişlikte.
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
    textAlign: 'center',
  },
  input: {
    // width: '100%', // Zaten paddingHorizontal ile ayarlanıyor
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
    // width: '100%', // Gerekirse eklenebilir, genellikle container'a göre hizalanır
    backgroundColor: YOUR_NEW_YELLOW_COLOR,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  noAccountText: {
    fontSize: 14,
    color: '#555',
  },
  signUpLink: {
    fontSize: 14,
    color: YOUR_NEW_YELLOW_COLOR,
    fontWeight: 'bold',
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
    // marginBottom: 20, // ScrollView'in paddingBottom'u ile ayarlanabilir
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