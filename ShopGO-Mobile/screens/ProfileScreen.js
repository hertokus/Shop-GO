// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CUSTOM_GREEN_COLOR = '#005800';
const TEXT_COLOR_DARK = '#333333';
// TEXT_COLOR_MEDIUM kullanılıyorsa ve hala sorun çıkarıyorsa, 
// aşağıdaki gibi doğrudan renk kodu kullanabilir veya tanımlı olduğundan emin olabilirsiniz.
// Şimdilik TEXT_COLOR_MEDIUM kullanımını kaldırdım, yerine TEXT_COLOR_LIGHT veya doğrudan renk kodu kullanıldı.
const TEXT_COLOR_LIGHT = '#777777'; 
const BORDER_COLOR = '#e0e0e0';
const DESTRUCTIVE_COLOR = '#d32f2f';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setUserData(user);
        } else {
          console.log("AsyncStorage'da kullanıcı bilgisi bulunamadı.");
        }
      } catch (e) {
        console.error("AsyncStorage'dan kullanıcı verisi okunurken hata:", e);
        Alert.alert("Hata", "Kullanıcı bilgileri yüklenemedi.");
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
        fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Çıkış Yap',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Başarılı!', 'Başarıyla çıkış yaptınız.');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (e) {
              console.error("Çıkış yapılırken AsyncStorage temizleme hatası:", e);
              Alert.alert("Hata", "Çıkış yapılırken bir sorun oluştu.");
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const MenuItem = ({ iconName, text, subText, onPress, isLastItem = false, isDestructive = false }) => (
    <TouchableOpacity
        style={[styles.menuItem, isLastItem && styles.menuItemNoBorder]}
        onPress={onPress}
        activeOpacity={0.6}
    >
      <Ionicons
        name={iconName}
        size={23}
        color={isDestructive ? DESTRUCTIVE_COLOR : CUSTOM_GREEN_COLOR}
        style={styles.menuIcon}
      />
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{text}</Text>
        {subText && <Text style={styles.menuSubText}>{subText}</Text>}
      </View>
      {!isDestructive && <Ionicons name="chevron-forward-outline" size={20} color="#cccccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.greetingCard}>
        <Ionicons name="person-circle" size={64} color={CUSTOM_GREEN_COLOR} style={styles.profileAvatar} />
        <Text style={styles.greetingText}>
          Merhaba, {userData?.fullName || userData?.username || 'Misafir'}!
        </Text>
        {userData?.email && <Text style={styles.emailText}>{userData.email}</Text>}
      </View>

      <View style={styles.menuGroup}>
        <MenuItem
          iconName="person-outline"
          text="Hesap Sahibi"
          subText={userData?.username || 'Yükleniyor...'}
          onPress={() => { /* Opsiyonel: Profil detayları için ayrı bir ekran olabilir */ }}
        />
        <MenuItem
          iconName="location-outline"
          text="Adresim"
          subText="Akkapı, Akkapı Mahallesi, Seyhan"
          onPress={() => Alert.alert("Adreslerim", "Bu özellik yakında eklenecektir.")}
        />
        <MenuItem
          iconName="pricetag-outline"
          text="İndirim Kuponlarım"
          subText="Kuponlarımı Gör"
          onPress={() => Alert.alert("İndirim Kuponlarım", "Bu özellik yakında eklenecektir.")}
        />
        <MenuItem
          iconName="settings-outline"
          text="Hesap Ayarları"
          // Yönlendirme kaldırıldı, eski Alert'e dönüldü
          onPress={() => Alert.alert("Hesap Ayarları", "Bu özellik yakında eklenecektir.")}
          isLastItem={true}
        />
      </View>

      <View style={styles.menuGroup}>
        <MenuItem
          iconName="log-out-outline"
          text="Çıkış Yap"
          onPress={handleLogout}
          isDestructive
          isLastItem={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  greetingCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatar: {
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 21,
    fontWeight: '600',
    color: TEXT_COLOR_DARK,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    color: '#555555', // TEXT_COLOR_MEDIUM yerine doğrudan renk kodu
  },
  menuGroup: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 15 : 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    fontWeight: '500',
  },
  menuSubText: {
    fontSize: 13,
    color: TEXT_COLOR_LIGHT,
    marginTop: 4,
  },
  destructiveText: {
    color: DESTRUCTIVE_COLOR,
    fontWeight: '500',
  },
});
