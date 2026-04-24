import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BoxListScreen from '../screens/BoxListScreen';
import BoxDetailScreen from '../screens/BoxDetailScreen';
import AddEditBoxScreen from '../screens/AddEditBoxScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';

export type RootStackParamList = {
  BoxList: undefined;
  BoxDetail: { boxId: number; boxName: string };
  AddEditBox: { boxId?: number; boxName?: string };
  AddEditItem: { itemId?: number; boxId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BoxList" component={BoxListScreen} options={{ title: 'My Workshop' }} />
      <Stack.Screen
        name="BoxDetail"
        component={BoxDetailScreen}
        options={({ route }) => ({ title: route.params.boxName })}
      />
      <Stack.Screen
        name="AddEditBox"
        component={AddEditBoxScreen}
        options={({ route }) => ({ title: route.params.boxId ? 'Edit Box' : 'New Box' })}
      />
      <Stack.Screen
        name="AddEditItem"
        component={AddEditItemScreen}
        options={({ route }) => ({ title: route.params.itemId ? 'Edit Item' : 'New Item' })}
      />
    </Stack.Navigator>
  );
}
