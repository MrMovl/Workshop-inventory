import { useCallback, useEffect, useState } from 'react';
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
import { colors, radius, space, type as t } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [includeBoxes, setIncludeBoxes] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const rows = query.trim()
        ? await searchAll(db, query, includeBoxes, 20, 0)
        : await getRecentAll(db, includeBoxes, 20);
      setResults(rows);
    } finally {
      setLoading(false);
    }
  }, [db, query, includeBoxes]);

  const refreshCount = useCallback(async () => {
    const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM items');
    setItemCount(row?.n ?? 0);
  }, [db]);

  useEffect(() => { loadResults(); }, [loadResults]);
  useEffect(() => { refreshCount(); }, [refreshCount]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      loadResults();
      refreshCount();
    });
  }, [navigation, loadResults, refreshCount]);

  const handleSelect = useCallback((item: SearchResult) => {
    if (item.type === 'item') {
      navigation.navigate('AddEditItem', { itemId: item.id });
    } else {
      navigation.navigate('AddEditBox', { boxId: item.id, boxName: item.name });
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerCrumb}>Inventory</Text>
          <Text style={styles.headerTitle}>My Workshop</Text>
        </View>
        <Text style={styles.headerCount}>{itemCount}</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items and boxes…"
          placeholderTextColor={colors.inkSubtle}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => setIncludeBoxes(v => !v)}>
        <View style={[styles.checkbox, includeBoxes && styles.checkboxChecked]}>
          {includeBoxes && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Include boxes in search</Text>
      </Pressable>

      <ScrollView style={styles.resultScroll} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator style={styles.spinner} color={colors.inkSubtle} />
        ) : results.length === 0 ? (
          <Text style={styles.emptyText}>No results</Text>
        ) : (
          <View style={styles.resultList}>
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
          </View>
        )}
      </ScrollView>

      <View style={styles.buttons}>
        <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('AddEditBox', {})}>
          <Text style={styles.buttonSecondaryText}>+ New Box</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('AddEditItem', {})}>
          <Text style={styles.buttonText}>+ New Item</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: colors.paper },

  header:              { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
                         paddingHorizontal: space[4], paddingTop: space[5], paddingBottom: space[4],
                         borderBottomWidth: 1, borderColor: colors.line },
  headerCrumb:         { ...t.label },
  headerTitle:         { ...t.title, color: colors.ink, marginTop: 2 },
  headerCount:         { ...t.mono, fontSize: 14, marginBottom: 2 },

  searchRow:           { paddingHorizontal: space[4], paddingTop: space[4], paddingBottom: space[2] },
  searchInput:         { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                         paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
                         backgroundColor: colors.paperAlt, color: colors.ink },

  checkboxRow:         { flexDirection: 'row', alignItems: 'center',
                         paddingHorizontal: space[4], paddingBottom: space[3] },
  checkbox:            { width: 18, height: 18, borderRadius: 4, marginRight: 8,
                         alignItems: 'center', justifyContent: 'center',
                         borderWidth: 1.5, borderColor: colors.ink },
  checkboxChecked:     { backgroundColor: colors.ink },
  checkmark:           { color: colors.paper, fontSize: 11, lineHeight: 12, fontWeight: '700' },
  checkboxLabel:       { fontSize: 13, color: colors.inkMuted },

  resultScroll:        { flex: 1, paddingHorizontal: space[4] },
  resultList:          { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                         backgroundColor: '#fff', overflow: 'hidden', marginBottom: space[2] },
  resultRow:           { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14,
                         paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth,
                         borderColor: colors.lineSoft },
  resultBadge:         { fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', borderRadius: 3,
                         paddingHorizontal: 6, paddingVertical: 2, marginRight: 10, marginTop: 2,
                         overflow: 'hidden' },
  badgeItem:           { backgroundColor: colors.ink, color: colors.paper },
  badgeBox:            { color: colors.inkMuted, borderWidth: 1, borderColor: colors.line },
  resultText:          { flex: 1 },
  resultName:          { ...t.bodyMd, color: colors.ink },
  resultDesc:          { ...t.caption, marginTop: 2 },
  spinner:             { marginVertical: 16 },
  emptyText:           { padding: space[4], textAlign: 'center', color: colors.inkSubtle, fontSize: 14 },

  buttons:             { flexDirection: 'row', gap: space[3],
                         padding: space[4], borderTopWidth: 1, borderColor: colors.line },
  button:              { flex: 1, backgroundColor: colors.ink, borderRadius: radius.md,
                         paddingVertical: 14, alignItems: 'center' },
  buttonText:          { color: colors.paper, fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  buttonSecondary:     { flex: 1, backgroundColor: colors.paper, borderRadius: radius.md,
                         paddingVertical: 14, alignItems: 'center',
                         borderWidth: 1, borderColor: colors.line },
  buttonSecondaryText: { color: colors.ink, fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
});
