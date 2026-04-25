import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, radius, space, type as t } from '../theme';
import { useLocale } from '../i18n/LanguageContext';
import type { Locale } from '../i18n/translations';
import { exportBackup, importBackup } from '../utils/backup';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: Props) {
  const [language, setLanguage] = useLocale();
  const db = useSQLiteContext();
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportBackup(db);
    } catch (e) {
      Alert.alert('Export failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleImportPress() {
    Alert.alert(
      'Overwrite all data?',
      'Importing a backup will permanently delete all current boxes, items, and categories. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import & overwrite',
          style: 'destructive',
          onPress: runImport,
        },
      ],
    );
  }

  async function runImport() {
    setBusy(true);
    try {
      await importBackup(db);
      onClose();
    } catch (e) {
      Alert.alert('Import failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Text style={styles.closeX}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Language</Text>
          <View style={styles.radioGroup}>
            {(['en', 'de'] as Locale[]).map(lang => (
              <Pressable key={lang} style={styles.radioRow} onPress={() => setLanguage(lang)}>
                <View style={[styles.radioOuter, language === lang && styles.radioOuterSelected]}>
                  {language === lang && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{lang === 'en' ? 'English' : 'Deutsch'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Backup & Restore</Text>

          <Pressable
            style={[styles.backupButton, busy && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={busy}
          >
            <Text style={styles.backupButtonText}>
              {busy ? 'Working…' : 'Export backup'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.importButton, busy && styles.buttonDisabled]}
            onPress={handleImportPress}
            disabled={busy}
          >
            <Text style={styles.importButtonText}>Import backup</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,26,22,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[4],
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: space[5],
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[5],
  },
  modalTitle: { ...t.title, color: colors.ink },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 16, color: colors.inkMuted },

  sectionLabel: {
    ...t.label,
    marginBottom: space[3],
  },
  radioGroup: { gap: space[3], marginBottom: space[5] },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: colors.ink },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  radioLabel: { fontSize: 15, color: colors.ink },

  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: space[4],
  },
  backupButton: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.paperAlt,
    marginBottom: space[3],
  },
  backupButtonText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  importButton: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.paperAlt,
  },
  importButtonText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  buttonDisabled: { opacity: 0.45 },
});
