import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getRecentAll, searchAll } from '../db/database';
import { SearchResult } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [includeBoxes, setIncludeBoxes] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchRowHeight, setSearchRowHeight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (blurTimer.current) clearTimeout(blurTimer.current); };
  }, []);

  const loadResults = useCallback(async (q: string, incBoxes: boolean) => {
    setLoading(true);
    try {
      const rows = q.trim()
        ? await searchAll(db, q, incBoxes, 10, 0)
        : await getRecentAll(db, incBoxes, 10);
      setResults(rows);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (!dropdownVisible) return;
    loadResults(query, includeBoxes);
  }, [query, includeBoxes, dropdownVisible, loadResults]);

  const onSearchFocus = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setDropdownVisible(true);
  }, []);

  const onSearchBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setDropdownVisible(false), 150);
  }, []);

  const onCheckboxPress = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setIncludeBoxes(v => !v);
  }, []);

  const handleSelect = useCallback((item: SearchResult) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setDropdownVisible(false);
    setQuery('');
    if (item.type === 'item') {
      navigation.navigate('AddEditItem', { itemId: item.id });
    } else {
      navigation.navigate('AddEditBox', { boxId: item.id, boxName: item.name });
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => navigation.navigate('AddEditBox', {})}>
          <Text style={styles.buttonText}>Add Box</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('AddEditItem', {})}>
          <Text style={styles.buttonText}>Add Item</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <View
          style={styles.searchRow}
          onLayout={e => setSearchRowHeight(e.nativeEvent.layout.height)}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search items and boxes…"
            value={query}
            onChangeText={setQuery}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            autoCorrect={false}
          />
        </View>

        {dropdownVisible && (
          <View style={[styles.dropdown, { top: searchRowHeight }]}>
            {loading ? (
              <ActivityIndicator style={styles.spinner} />
            ) : results.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No results</Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.dropdownScroll}>
                {results.map(item => (
                  <Pressable
                    key={`${item.type}-${item.id}`}
                    style={styles.resultRow}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.resultBadge, item.type === 'box' ? styles.badgeBox : styles.badgeItem]}>
                      {item.type === 'box' ? 'Box' : 'Item'}
                    </Text>
                    <View style={styles.resultText}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      {item.description ? <Text style={styles.resultDesc}>{item.description}</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      <Pressable style={styles.checkboxRow} onPress={onCheckboxPress}>
        <View style={[styles.checkbox, includeBoxes && styles.checkboxChecked]}>
          {includeBoxes && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Include boxes in search</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  buttons: { flexDirection: 'row', gap: 12, padding: 16 },
  button: {
    flex: 1,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  searchWrapper: { zIndex: 1, elevation: 1 },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  dropdownScroll: { maxHeight: 300 },
  dropdownEmpty: { padding: 16, textAlign: 'center', color: '#888', fontSize: 14 },
  spinner: { marginVertical: 16 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  resultBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
    marginTop: 2,
    overflow: 'hidden',
  },
  badgeItem: { backgroundColor: '#1a73e8' },
  badgeBox: { backgroundColor: '#888' },
  resultText: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '500', color: '#111' },
  resultDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#1a73e8' },
  checkmark: { color: '#fff', fontSize: 13, lineHeight: 15 },
  checkboxLabel: { fontSize: 14, color: '#444' },
});
