import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type as t } from '../theme';

type Language = 'en' | 'de';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: Props) {
  const [language, setLanguage] = useState<Language>('en');

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
            {(['en', 'de'] as Language[]).map(lang => (
              <Pressable key={lang} style={styles.radioRow} onPress={() => setLanguage(lang)}>
                <View style={[styles.radioOuter, language === lang && styles.radioOuterSelected]}>
                  {language === lang && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{lang === 'en' ? 'English' : 'Deutsch'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.backupButton} onPress={() => {}}>
            <Text style={styles.backupButtonText}>Backup</Text>
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
  },
  backupButtonText: { fontSize: 15, fontWeight: '600', color: colors.ink },
});
