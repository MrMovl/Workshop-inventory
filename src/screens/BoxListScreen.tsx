import { View, Text, StyleSheet } from 'react-native';

export default function BoxListScreen() {
  return (
    <View style={styles.container}>
      <Text>Box List</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
