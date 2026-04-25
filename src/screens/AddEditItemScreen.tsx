import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { persistPhoto } from '../utils/persistPhoto';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createItem, deleteItem, getBoxById, getItemById, getRecentBoxes, searchBoxes, updateItem } from '../db/database';
import { colors, radius, space, type as t } from '../theme';
import { Box } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTranslation } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditItem'>;

export default function AddEditItemScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const tr = useTranslation();
  const { itemId } = route.params ?? {};

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
    if (!itemId) return;
    (async () => {
      const item = await getItemById(db, itemId);
      if (!item) return;
      setName(item.name);
      setDescription(item.description ?? '');
      setAmount(String(item.amount));
      setPhotoUri(item.photoUri);
      const box = await getBoxById(db, item.boxId);
      if (box) setPickedBox(box);
    })();
  }, [db, itemId]);

  useEffect(() => {
    if (!boxInputFocused) return;
    if (boxQuery.trim()) {
      searchBoxes(db, boxQuery).then(setBoxResults).catch(() => setBoxResults([]));
    } else {
      getRecentBoxes(db).then(setBoxResults).catch(() => setBoxResults([]));
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
      Alert.alert(tr.item_permissionTitle, tr.item_permissionMessage, [
        { text: tr.item_cancel, style: 'cancel' },
        { text: tr.perm_openSettings, onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
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
      setPhotoUri(await persistPhoto(resized.uri));
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

  const handleDelete = useCallback(() => {
    Alert.alert(tr.item_deleteConfirmTitle, tr.item_deleteConfirmMessage, [
      { text: tr.item_cancel, style: 'cancel' },
      {
        text: tr.item_deleteConfirm,
        style: 'destructive',
        onPress: async () => {
          await deleteItem(db, itemId!);
          navigation.goBack();
        },
      },
    ]);
  }, [db, itemId, navigation, tr]);

  const save = useCallback(async () => {
    let valid = true;

    if (!name.trim()) {
      setNameError(tr.item_nameRequired);
      valid = false;
    } else {
      setNameError('');
    }

    const parsedAmount = parseInt(amount, 10);
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount < 1) {
      setAmountError(tr.item_amountError);
      valid = false;
    } else {
      setAmountError('');
    }

    if (!pickedBox) {
      setBoxError(tr.item_boxRequired);
      valid = false;
    } else {
      setBoxError('');
    }

    if (!valid) return;

    if (itemId) {
      await updateItem(db, itemId, pickedBox!.id, name.trim(), description.trim(), photoUri, parsedAmount);
    } else {
      await createItem(db, pickedBox!.id, name.trim(), description.trim(), photoUri, parsedAmount);
    }
    navigation.goBack();
  }, [db, name, description, amount, photoUri, pickedBox, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}
      >
      <ScrollView
        contentContainerStyle={[styles.scroll, boxInputFocused && styles.scrollFocused]}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.label}>{tr.item_nameLabel}</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          value={name}
          onChangeText={t => { setName(t); if (t.trim()) setNameError(''); }}
          placeholder={tr.item_namePlaceholder}
          returnKeyType="next"
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

        <Text style={styles.label}>{tr.item_descriptionLabel}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder={tr.item_descriptionPlaceholder}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.amountPhotoRow}>
          <View style={styles.amountCol}>
            <Text style={styles.label}>{tr.item_amountLabel}</Text>
            <TextInput
              style={[styles.input, styles.amountInput, amountError ? styles.inputError : null]}
              value={amount}
              onChangeText={t => { setAmount(t); setAmountError(''); }}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            {amountError ? <Text style={styles.error}>{amountError}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>{tr.item_photoLabel}</Text>
        {photoUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} resizeMode="contain" />
            <View style={styles.imageActions}>
              <Pressable style={styles.imageChangeBtn} onPress={pickImage}>
                <Text style={styles.imageChangeBtnText}>{tr.item_changePhoto}</Text>
              </Pressable>
              <Pressable style={styles.imageChangeBtn} onPress={() => setPhotoUri(null)}>
                <Text style={styles.imageChangeBtnText}>{tr.item_removePhoto}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>{tr.item_addPhoto}</Text>
          </Pressable>
        )}

        <Text style={styles.label}>{tr.item_boxLabel}</Text>
        {pickedBox ? (
          <View style={[styles.pickedBox, boxError ? styles.inputError : null]}>
            <Text style={styles.pickedBoxLbl}>{tr.item_boxIn}</Text>
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
              placeholder={tr.item_boxSearchPlaceholder}
            />
            {boxError ? <Text style={styles.error}>{boxError}</Text> : null}
          </>
        )}
        {pickedBox && boxError ? <Text style={styles.error}>{boxError}</Text> : null}

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>{tr.item_save}</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>{tr.item_cancel}</Text>
        </Pressable>

        {itemId ? (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>{tr.item_delete}</Text>
          </Pressable>
        ) : null}

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.paper },
  flex:         { flex: 1 },
  scroll:       { padding: space[4], paddingBottom: space[8] },
  scrollFocused:{ paddingBottom: 320 },

  label:        { ...t.label, marginTop: space[4], marginBottom: space[1] },

  input:        { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
                  backgroundColor: colors.paperAlt, color: colors.ink },
  inputError:   { borderColor: colors.danger },
  multiline:    { minHeight: 80 },
  amountInput:  { width: 96, textAlign: 'right' },
  error:        { fontSize: 12, color: colors.danger, marginTop: 4 },

  imagePicker:  { height: 120, borderWidth: 1, borderStyle: 'dashed',
                  borderColor: colors.line, borderRadius: radius.md,
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  backgroundColor: colors.paperAlt },
  imagePickerIcon: { fontSize: 22, color: colors.inkSubtle },
  imagePickerText: { color: colors.inkSubtle, fontSize: 14 },
  imageContainer:  { gap: 8 },
  imagePreview: { width: '100%', height: 200, borderRadius: radius.md,
                  backgroundColor: colors.paperAlt },
  imageActions: { flexDirection: 'row', gap: 8 },
  imageChangeBtn: { paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
  imageChangeBtnText: { color: colors.ink, fontSize: 13, fontWeight: '600' },

  amountPhotoRow:{ flexDirection: 'row', gap: 14, alignItems: 'flex-end' },
  amountCol:    { flexShrink: 0 },

  pickedBox:    { flexDirection: 'row', alignItems: 'center', gap: 8,
                  borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md,
                  paddingHorizontal: 14, paddingVertical: 12,
                  backgroundColor: colors.accentSoft },
  pickedBoxLbl: { ...t.label, color: colors.accent, marginRight: 4 },
  pickedBoxName:{ flex: 1, fontSize: 15, color: colors.ink, fontWeight: '500' },
  unpick:       { fontSize: 22, color: colors.accent, lineHeight: 26, paddingLeft: 8 },

  boxDropdown:  { maxHeight: 220, borderWidth: 1, borderColor: colors.line,
                  borderRadius: radius.md, backgroundColor: '#fff', marginBottom: 4,
                  overflow: 'hidden' },
  boxResult:    { paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  boxResultText:{ fontSize: 15, color: colors.ink },

  saveBtn:      { marginTop: space[7], backgroundColor: colors.accent,
                  borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnText:  { color: colors.accentInk, fontSize: 15, fontWeight: '600' },
  cancelBtn:    { marginTop: space[3], borderRadius: radius.md, paddingVertical: 14,
                  alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  cancelBtnText:{ color: colors.inkMuted, fontSize: 15, fontWeight: '600' },

  deleteBtn:    { marginTop: space[7], backgroundColor: colors.danger,
                  borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText:{ color: colors.accentInk, fontSize: 15, fontWeight: '600' },
});
