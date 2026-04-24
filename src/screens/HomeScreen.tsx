import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { searchAll } from '../db/database';
import { SearchResult } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const PAGE_SIZE = 10;
const SCROLL_THRESHOLD = 200;

export default function HomeScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [includeBoxes, setIncludeBoxes] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = useRef<FlatList<SearchResult>>(null);
  const queryRef = useRef('');
  const includeBoxesRef = useRef(true);

  const loadPage = useCallback(
    async (q: string, incBoxes: boolean, off: number, reset: boolean) => {
      if (!q.trim()) {
        if (reset) setResults([]);
        return;
      }
      setLoading(true);
      try {
        const rows = await searchAll(db, q, incBoxes, PAGE_SIZE, off);
        if (reset) {
          setResults(rows);
        } else {
          setResults(prev => [...prev, ...rows]);
        }
        setHasMore(rows.length === PAGE_SIZE);
        setOffset(off + rows.length);
      } finally {
        setLoading(false);
      }
    },
    [db],
  );

  useEffect(() => {
    queryRef.current = query;
    includeBoxesRef.current = includeBoxes;
    setResults([]);
    setOffset(0);
    setHasMore(false);
    loadPage(query, includeBoxes, 0, true);
  }, [query, includeBoxes, loadPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    loadPage(queryRef.current, includeBoxesRef.current, offset, false);
  }, [loading, hasMore, offset, loadPage]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(e.nativeEvent.contentOffset.y > SCROLL_THRESHOLD);
  }, []);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => navigation.navigate('AddEditBox', {})}>
          <Text style={styles.buttonText}>Add Box</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('BoxList')}>
          <Text style={styles.buttonText}>Add Item</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items and boxes…"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => setIncludeBoxes(v => !v)}>
        <View style={[styles.checkbox, includeBoxes && styles.checkboxChecked]}>
          {includeBoxes && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Include boxes in search</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={results}
        keyExtractor={item => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <Text style={[styles.resultBadge, item.type === 'box' ? styles.badgeBox : styles.badgeItem]}>
              {item.type === 'box' ? 'Box' : 'Item'}
            </Text>
            <View style={styles.resultText}>
              <Text style={styles.resultName}>{item.name}</Text>
              {item.description ? <Text style={styles.resultDesc}>{item.description}</Text> : null}
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        ListEmptyComponent={
          query.trim() && !loading ? <Text style={styles.empty}>No results found</Text> : null
        }
        ListFooterComponent={loading ? <ActivityIndicator style={styles.spinner} /> : null}
      />

      {showScrollTop && (
        <Pressable style={styles.scrollTopBtn} onPress={scrollToTop}>
          <Text style={styles.scrollTopText}>↑</Text>
        </Pressable>
      )}
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
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
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
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 15 },
  spinner: { marginVertical: 16 },
  scrollTopBtn: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: 28,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollTopText: { color: '#fff', fontSize: 22, lineHeight: 26 },
});
