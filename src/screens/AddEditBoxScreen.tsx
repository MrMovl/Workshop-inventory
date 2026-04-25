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
import { colors, categoryPalette, radius, space, type as t } from '../theme';
import { Category } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditBox'>;

const PALETTE = categoryPalette;

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
                selectedCategoryId === cat.id && styles.chipSelected,
              ]}
              onPress={() => toggleExistingCategory(cat.id)}
            >
              <View style={[styles.chipDot, { backgroundColor: cat.color }]} />
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

        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.paper },
  form:         { padding: space[4], gap: space[1] },

  label:        { ...t.label, marginTop: space[4], marginBottom: space[1] },
  required:     { color: colors.accent },

  input:        { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
                  backgroundColor: colors.paperAlt, color: colors.ink },
  textArea:     { minHeight: 96, paddingTop: 12 },
  charCount:    { ...t.mono, fontSize: 11, textAlign: 'right', marginTop: 2 },

  imagePicker:  { height: 120, borderWidth: 1, borderStyle: 'dashed',
                  borderColor: colors.line, borderRadius: radius.md,
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  backgroundColor: colors.paperAlt },
  imagePickerIcon: { fontSize: 22, color: colors.inkSubtle },
  imagePickerText: { color: colors.inkSubtle, fontSize: 14 },
  imageContainer:  { gap: 8 },
  imagePreview: { width: '100%', height: 200, borderRadius: radius.md,
                  backgroundColor: colors.paperAlt },
  imageChangeBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line,
                    marginTop: space[2] },
  imageChangeBtnText: { color: colors.ink, fontSize: 13, fontWeight: '600' },

  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space[1] },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 12, paddingVertical: 7,
                  borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line,
                  backgroundColor: colors.paper },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipNew:      { borderStyle: 'dashed', borderColor: colors.line },
  chipNewActive:{ backgroundColor: colors.ink, borderColor: colors.ink },
  chipDot:      { width: 8, height: 8, borderRadius: 4 },
  chipText:     { fontSize: 13, color: colors.inkMuted },
  chipTextSelected: { color: colors.paper },

  newCatForm:   { marginTop: space[3], padding: space[3], borderWidth: 1,
                  borderColor: colors.line, borderRadius: radius.md, gap: space[2],
                  backgroundColor: colors.paperAlt },
  colorLabel:   { ...t.label, marginTop: 4 },
  colorGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch:       { width: 32, height: 32, borderRadius: 16 },
  swatchSelected:{ borderWidth: 2, borderColor: colors.ink, transform: [{ scale: 1.1 }] },

  saveBtn:      { marginTop: space[6], backgroundColor: colors.accent,
                  borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText:  { color: colors.accentInk, fontSize: 15, fontWeight: '600' },

  cancelBtn:    { marginTop: space[3], borderRadius: radius.md, paddingVertical: 14,
                  alignItems: 'center', borderWidth: 1, borderColor: colors.line,
                  backgroundColor: 'transparent' },
  cancelBtnText:{ color: colors.inkMuted, fontSize: 15, fontWeight: '600' },
});
