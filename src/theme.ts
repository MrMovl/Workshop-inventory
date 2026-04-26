export const colors = {
  paper:      '#F4EFE6',
  paperAlt:   '#ECE5D7',
  paperDeep:  '#E2D9C6',
  ink:        '#1C1A16',
  inkMuted:   '#4A443B',
  inkSubtle:  '#8A8071',
  line:       '#D6CDB9',
  lineSoft:   '#E6DEC9',
  accent:     '#B6651E',
  accentInk:  '#FFF8EF',
  accentSoft: '#F3E6D0',
  danger:     '#A83A25',
  ok:         '#4D6A3B',
};

export const categoryPalette = [
  '#C8553D', // tomato
  '#C0762A', // amber
  '#B8902C', // mustard
  '#9E9E36', // citron
  '#5A8042', // moss
  '#3F8074', // teal
  '#3F6E92', // steel
  '#5C5BA4', // indigo
  '#8A4F8E', // plum
  '#A24A3E', // brick
  '#6D4C41', // walnut
  '#546E7A', // slate
];

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 };
export const space  = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 48 };

export const type = {
  display: { fontSize: 28, letterSpacing: -0.4, lineHeight: 32, fontWeight: '600' as const },
  title:   { fontSize: 22, letterSpacing: -0.2, fontWeight: '600' as const },
  body:    { fontSize: 16 },
  bodyMd:  { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, color: colors.inkMuted },
  label:   { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' as const, color: colors.inkMuted, fontWeight: '500' as const },
  mono:    { fontSize: 12, color: colors.inkSubtle },
};
