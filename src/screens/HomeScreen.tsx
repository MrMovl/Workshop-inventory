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
import { colors, radius, space, type as t } from '../theme';
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

      {dropdownVisible && (
        <Pressable style={styles.backdrop} onPress={() => setDropdownVisible(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.paper },
  buttons:      { flexDirection: 'row', gap: space[3], padding: space[4] },
  button:       { flex: 1, backgroundColor: colors.ink, borderRadius: radius.md,
                  paddingVertical: 14, alignItems: 'center' },
  buttonText:   { color: colors.paper, fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },

  searchWrapper:{ zIndex: 10, elevation: 10 },
  backdrop:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },
  searchRow:    { paddingHorizontal: space[4], paddingBottom: space[2] },
  searchInput:  { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
                  backgroundColor: colors.paperAlt, color: colors.ink },

  dropdown:     { position: 'absolute', left: space[4], right: space[4], maxHeight: 320,
                  borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                  backgroundColor: '#fff', overflow: 'hidden',
                  shadowColor: '#1C1A16', shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.10, shadowRadius: 24, elevation: 4, zIndex: 10 },
  dropdownScroll:{ maxHeight: 320 },
  dropdownEmpty:{ padding: space[4], textAlign: 'center', color: colors.inkSubtle, fontSize: 14 },
  spinner:      { marginVertical: 16 },
  resultRow:    { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14,
                  paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.line },
  resultBadge:  { fontSize: 9.5, letterSpacing: 1,
                  textTransform: 'uppercase', borderRadius: 3,
                  paddingHorizontal: 6, paddingVertical: 2, marginRight: 10, marginTop: 2,
                  overflow: 'hidden' },
  badgeItem:    { backgroundColor: colors.ink, color: colors.paper },
  badgeBox:     { color: colors.inkMuted, borderWidth: 1, borderColor: colors.line },
  resultText:   { flex: 1 },
  resultName:   { ...t.bodyMd, color: colors.ink },
  resultDesc:   { ...t.caption, marginTop: 2 },

  checkboxRow:  { flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: space[4], paddingBottom: space[3] },
  checkbox:     { width: 18, height: 18, borderRadius: 4, marginRight: 8,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5, borderColor: colors.ink },
  checkboxChecked: { backgroundColor: colors.ink },
  checkmark:    { color: colors.paper, fontSize: 11, lineHeight: 12, fontWeight: '700' },
  checkboxLabel:{ fontSize: 13, color: colors.inkMuted },
});
