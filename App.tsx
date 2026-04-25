import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <SQLiteProvider databaseName="workshop.db" onInit={initDatabase}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="#F4EFE6" />
          <AppNavigator />
        </NavigationContainer>
      </SQLiteProvider>
    </LanguageProvider>
  );
}
