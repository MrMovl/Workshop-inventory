import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SQLiteProvider databaseName="workshop.db" onInit={initDatabase}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#F4EFE6" />
        <AppNavigator />
      </NavigationContainer>
    </SQLiteProvider>
  );
}
