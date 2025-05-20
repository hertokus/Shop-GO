import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

export default function CartScreen({ route, navigation }) {
  const { cartItems } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.quantity}>Adet: {item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alışveriş Listesi</Text>
      {cartItems.length === 0 ? (
        <Text>Henüz ürün seçilmedi.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Marketleri Karşılaştır"
            onPress={() => navigation.navigate("Compare", { cartItems })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 16 },
  quantity: { fontSize: 14, color: '#666' },
  footer: { marginTop: 20 }
});
