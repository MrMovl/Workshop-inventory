import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createItem, getRecentBoxes, searchBoxes } from '../db/database';
import { Box } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditItem'>;

export default function AddEditItemScreen({ navigation }: Props) {
  const db = useSQLiteContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('1');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pickedBox, setPickedBox] = useState<Box | null>(null);
  const [boxQuery, setBoxQuery] = useState('');
  const [boxResults, setBoxResults] = useState<Box[]>([]);
  const [boxInputFocused, setBoxInputFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [boxError, setBoxError] = useState('');

  useEffect(() => {
    return () => { if (blurTimer.current) clearTimeout(blurTimer.current); };
  }, []);

  useEffect(() => {
    if (!boxInputFocused) return;
    if (boxQuery.trim()) {
      searchBoxes(db, boxQuery).then(setBoxResults);
    } else {
      getRecentBoxes(db).then(setBoxResults);
    }
  }, [boxQuery, boxInputFocused, db]);

  const onBoxFocus = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setBoxInputFocused(true);
  }, []);

  const onBoxBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setBoxInputFocused(false), 150);
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to add a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const pickBox = useCallback((box: Box) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setBoxInputFocused(false);
    setPickedBox(box);
    setBoxQuery('');
    setBoxResults([]);
    setBoxError('');
  }, []);

  const unpickBox = useCallback(() => {
    setPickedBox(null);
  }, []);

  const save = useCallback(async () => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Name is required.');
      valid = false;
    } else {
      setNameError('');
    }

    const parsedAmount = parseInt(amount, 10);
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount < 1) {
      setAmountError('Amount must be a positive number.');
      valid = false;
    } else {
      setAmountError('');
    }

    if (!pickedBox) {
      setBoxError('A box is required.');
      valid = false;
    } else {
      setBoxError('');
    }

    if (!valid) return;

    await createItem(db, pickedBox!.id, name.trim(), description.trim(), photoUri, parsedAmount);
    navigation.goBack();
  }, [db, name, description, amount, photoUri, pickedBox, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          value={name}
          onChangeText={t => { setName(t); if (t.trim()) setNameError(''); }}
          placeholder="e.g. Wood screws M4×20"
          returnKeyType="next"
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Any extra detail…"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={[styles.input, styles.amountInput, amountError ? styles.inputError : null]}
          value={amount}
          onChangeText={t => { setAmount(t); setAmountError(''); }}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        {amountError ? <Text style={styles.error}>{amountError}</Text> : null}

        <Text style={styles.label}>Photo</Text>
        {photoUri ? (
          <View style={styles.imageRow}>
            <Image source={{ uri: photoUri }} style={styles.thumbnail} />
            <Pressable style={styles.removeBtn} onPress={() => setPhotoUri(null)}>
              <Text style={styles.removeBtnText}>Remove</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.photoBtn} onPress={pickImage}>
            <Text style={styles.photoBtnText}>Add Photo</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Box *</Text>
        {pickedBox ? (
          <View style={[styles.pickedBox, boxError ? styles.inputError : null]}>
            <Text style={styles.pickedBoxName} numberOfLines={1}>{pickedBox.name}</Text>
            <Pressable onPress={unpickBox} hitSlop={8}>
              <Text style={styles.unpick}>×</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {boxInputFocused && boxResults.length > 0 && (
              <View style={styles.boxDropdown}>
                {boxResults.map(box => (
                  <Pressable key={box.id} style={styles.boxResult} onPress={() => pickBox(box)}>
                    <Text style={styles.boxResultText}>{box.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TextInput
              style={[styles.input, boxError ? styles.inputError : null]}
              value={boxQuery}
              onChangeText={setBoxQuery}
              onFocus={onBoxFocus}
              onBlur={onBoxBlur}
              placeholder="Tap to see recent boxes or search…"
            />
            {boxError ? <Text style={styles.error}>{boxError}</Text> : null}
          </>
        )}
        {pickedBox && boxError ? <Text style={styles.error}>{boxError}</Text> : null}

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#111',
  },
  inputError: { borderColor: '#c00' },
  multiline: { minHeight: 80 },
  amountInput: { width: 100 },
  error: { fontSize: 12, color: '#c00', marginTop: 4 },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeBtnText: { fontSize: 14, color: '#444' },
  photoBtn: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  photoBtnText: { fontSize: 15, color: '#1a73e8', fontWeight: '600' },
  pickedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#e8f0fe',
  },
  pickedBoxName: { flex: 1, fontSize: 15, color: '#111' },
  unpick: { fontSize: 22, color: '#1a73e8', lineHeight: 26, paddingLeft: 8 },
  boxDropdown: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4,
    overflow: 'hidden',
  },
  boxResult: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  boxResultText: { fontSize: 15, color: '#111' },
  saveBtn: {
    marginTop: 32,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
