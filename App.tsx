import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SQLiteProvider databaseName="workshop.db" onInit={initDatabase}>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#F4EFE6" />
            <AppNavigator />
          </NavigationContainer>
        </SQLiteProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
