import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import BoxListScreen from '../screens/BoxListScreen';
import BoxDetailScreen from '../screens/BoxDetailScreen';
import AddEditBoxScreen from '../screens/AddEditBoxScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';
import { useTranslation } from '../i18n/LanguageContext';

export type RootStackParamList = {
  Home: undefined;
  BoxList: undefined;
  BoxDetail: { boxId: number; boxName: string };
  AddEditBox: { boxId?: number; boxName?: string };
  AddEditItem: { itemId?: number; boxId?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const t = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        headerLargeTitle: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BoxList" component={BoxListScreen} options={{ title: t.nav_boxes }} />
      <Stack.Screen
        name="BoxDetail"
        component={BoxDetailScreen}
        options={({ route }) => ({ title: route.params.boxName })}
      />
      <Stack.Screen
        name="AddEditBox"
        component={AddEditBoxScreen}
        options={({ route }) => ({ title: route.params.boxId ? t.nav_editBox : t.nav_newBox })}
      />
      <Stack.Screen
        name="AddEditItem"
        component={AddEditItemScreen}
        options={({ route }) => ({ title: route.params.itemId ? t.nav_editItem : t.nav_newItem })}
      />
    </Stack.Navigator>
  );
}
