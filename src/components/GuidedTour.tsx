import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type as t } from '../theme';
import { useTranslation } from '../i18n/LanguageContext';

interface Props {
  step: 0 | 1 | 2;
  onSkip: () => void;
}

// Height of the button bar: padding (16 top + 16 bottom) + button (14+14 vert padding + ~22 text)
const BUTTON_BAR_HEIGHT = 82;
// Height of header (~80) + search row (~72) + checkbox row (~40)
const ABOVE_SEARCH_HEIGHT = 192;

export default function GuidedTour({ step, onSkip }: Props) {
  const tr = useTranslation();
  const insets = useSafeAreaInsets();

  const isSearchStep = step === 2;

  const titles = [tr.tour_step1_title, tr.tour_step2_title, tr.tour_step3_title];
  const descs  = [tr.tour_step1_desc,  tr.tour_step2_desc,  tr.tour_step3_desc];

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[
        styles.card,
        isSearchStep
          ? { top: insets.top + ABOVE_SEARCH_HEIGHT + 8, right: space[4], width: '52%' }
          : { bottom: insets.bottom + BUTTON_BAR_HEIGHT + 8, left: space[4], right: space[4] },
      ]}>
        {/* Progress trail */}
        <View style={styles.progressRow}>
          <View style={styles.dots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, i <= step && styles.dotFilled]} />
            ))}
          </View>
          <Text style={styles.stepLabel}>{step + 1} / 3</Text>
        </View>

        <Text style={styles.cardTitle}>{titles[step]}</Text>
        <Text style={styles.cardDesc}>{descs[step]}</Text>

        {/* Arrow pointing toward the target element */}
        <View style={[
          styles.arrowRow,
          step === 1 && styles.arrowRowRight,
          isSearchStep && styles.arrowRowTop,
        ]}>
          <Text style={styles.arrowChar}>{isSearchStep ? '▲' : '▼'}</Text>
        </View>

        <Pressable onPress={onSkip} hitSlop={12} style={styles.skipButton}>
          <Text style={styles.skipText}>{tr.tour_skip}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  card: {
    position: 'absolute',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: space[4],
    // shadow
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    ...t.label,
    color: colors.accent,
  },

  cardTitle: {
    ...t.bodyMd,
    color: colors.ink,
    marginBottom: 4,
  },
  cardDesc: {
    ...t.caption,
    color: colors.inkMuted,
    lineHeight: 18,
    marginBottom: space[3],
  },

  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  arrowRowRight: {
    justifyContent: 'flex-end',
  },
  arrowRowTop: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  arrowChar: {
    fontSize: 16,
    color: colors.accent,
  },

  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  skipText: {
    ...t.caption,
    color: colors.inkSubtle,
    textDecorationLine: 'underline',
  },
});
