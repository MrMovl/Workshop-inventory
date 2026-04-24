import { View, Text, StyleSheet } from 'react-native';

export default function AddEditItemScreen() {
  return (
    <View style={styles.container}>
      <Text>Add / Edit Item</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
