import { View, Text, StyleSheet } from 'react-native';

export default function AddEditBoxScreen() {
  return (
    <View style={styles.container}>
      <Text>Add / Edit Box</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
