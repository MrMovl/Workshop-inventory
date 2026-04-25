import { useEffect, useState } from 'react';
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
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createBox, createCategory, getBoxById, getCategories, updateBox } from '../db/database';
import { Category } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditBox'>;

const PALETTE = [
  '#e53935', '#f4511e', '#fb8c00', '#fdd835',
  '#43a047', '#00897b', '#1e88e5', '#3949ab',
  '#8e24aa', '#d81b60', '#6d4c41', '#546e7a',
];

const NAME_MAX = 100;
const DESC_MAX = 500;
const CAT_NAME_MAX = 50;

export default function AddEditBoxScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const { boxId } = route.params ?? {};

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PALETTE[6]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories(db).then(setCategories);
  }, [db]);

  useEffect(() => {
    if (!boxId) return;
    (async () => {
      const box = await getBoxById(db, boxId);
      if (!box) return;
      setName(box.name);
      setDescription(box.description ?? '');
      setPhotoUri(box.photoUri);
      setSelectedCategoryId(box.categoryId);
    })();
  }, [db, boxId]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1, // pick full quality; we resize below
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const MAX = 600;
    const ratio = Math.min(MAX / asset.width, MAX / asset.height, 1);
    const resized = await ImageManipulator.manipulateAsync(
      asset.uri,
      ratio < 1
        ? [{ resize: { width: Math.round(asset.width * ratio), height: Math.round(asset.height * ratio) } }]
        : [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    setPhotoUri(resized.uri);
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a name for the box.');
      return;
    }
    setSaving(true);
    try {
      let categoryId = selectedCategoryId;
      if (showNewCategory && newCatName.trim()) {
        categoryId = await createCategory(db, newCatName.trim(), newCatColor);
      }
      if (boxId) {
        await updateBox(db, boxId, trimmedName, description.trim(), photoUri, categoryId);
      } else {
        await createBox(db, trimmedName, description.trim(), photoUri, categoryId);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  function toggleExistingCategory(id: number) {
    setSelectedCategoryId(prev => (prev === id ? null : id));
    setShowNewCategory(false);
  }

  function toggleNewCategory() {
    setShowNewCategory(v => !v);
    setSelectedCategoryId(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={styles.label}>
          Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={NAME_MAX}
          placeholder="e.g. Green Plastic Box 1"
          returnKeyType="next"
        />
        <Text style={styles.charCount}>{name.length}/{NAME_MAX}</Text>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          maxLength={DESC_MAX}
          placeholder="Optional details…"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/{DESC_MAX}</Text>

        {/* Image */}
        <Text style={styles.label}>Image</Text>
        {photoUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} resizeMode="contain" />
            <Pressable style={styles.imageChangeBtn} onPress={pickImage}>
              <Text style={styles.imageChangeBtnText}>Change photo</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>Tap to add photo</Text>
          </Pressable>
        )}

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                { borderColor: cat.color },
                selectedCategoryId === cat.id && { backgroundColor: cat.color },
              ]}
              onPress={() => toggleExistingCategory(cat.id)}
            >
              <Text style={[
                styles.chipText,
                selectedCategoryId === cat.id && styles.chipTextSelected,
              ]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.chip, styles.chipNew, showNewCategory && styles.chipNewActive]}
            onPress={toggleNewCategory}
          >
            <Text style={[styles.chipText, showNewCategory && styles.chipTextSelected]}>
              + New
            </Text>
          </Pressable>
        </View>

        {showNewCategory && (
          <View style={styles.newCatForm}>
            <TextInput
              style={styles.input}
              value={newCatName}
              onChangeText={setNewCatName}
              maxLength={CAT_NAME_MAX}
              placeholder="Category name"
            />
            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {PALETTE.map(color => (
                <Pressable
                  key={color}
                  style={[
                    styles.swatch,
                    { backgroundColor: color },
                    newCatColor === color && styles.swatchSelected,
                  ]}
                  onPress={() => setNewCatColor(color)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Save */}
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Box'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16, gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 12, marginBottom: 4 },
  required: { color: '#e53935' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: { height: 96, paddingTop: 10 },
  charCount: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 2 },
  imagePicker: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f9f9f9',
  },
  imagePickerIcon: { fontSize: 28 },
  imagePickerText: { color: '#888', fontSize: 15 },
  imageContainer: { gap: 8 },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#f0f0f0' },
  imageChangeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  imageChangeBtnText: { color: '#1a73e8', fontSize: 14, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  chipNew: { borderColor: '#1a73e8', borderStyle: 'dashed' },
  chipNewActive: { backgroundColor: '#1a73e8' },
  chipText: { fontSize: 14, color: '#444', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  newCatForm: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 8,
    backgroundColor: '#f9f9f9',
  },
  colorLabel: { fontSize: 13, fontWeight: '500', color: '#666' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#111',
    transform: [{ scale: 1.15 }],
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
