import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { C, RADIUS, SHADOW, TONE_COLOR } from '../theme';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'forest' | 'fresh';

export function Card({ children, style, padded = true }: { children: React.ReactNode; style?: ViewStyle; padded?: boolean }) {
  return <View style={[styles.card, padded && styles.cardPad, style]}>{children}</View>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Col({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.col, style]}>{children}</View>;
}

/** Responsive grid helpers shared by all three workspaces. */
export function useGridCols() {
  const { width } = useWindowDimensions();
  const content = width - (width >= 1024 ? 312 : 0) - 48;
  if (content >= 980) return 4;
  if (content >= 700) return 3;
  if (content >= 450) return 2;
  return 1;
}
export function gridWrap(gap = 14): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -gap / 2 };
}
export function gridItem(cols: number, gap = 14): ViewStyle {
  return { width: `${100 / cols}%`, paddingHorizontal: gap / 2, paddingBottom: gap };
}

export function Badge({ label, tone = 'neutral', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const bg = tone === 'neutral' ? '#F1F3EF' : `${TONE_COLOR[tone]}1A`;
  const fg = tone === 'neutral' ? C.muted : TONE_COLOR[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Dot({ tone = 'success', size = 8 }: { tone?: Tone; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: TONE_COLOR[tone] }} />;
}

export function Progress({ value, tone = 'success', height = 7, track = '#EEF1EB' }: { value: number; tone?: Tone; height?: number; track?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height, backgroundColor: track }]}>
      <View style={[styles.fill, { width: `${v}%`, backgroundColor: TONE_COLOR[tone], borderRadius: height / 2 }]} />
    </View>
  );
}

export function SectionHead({ eyebrow, title, subtitle, action, onAction, right }: { eyebrow?: string; title: string; subtitle?: string; action?: string; onAction?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
      {right}
      {action && onAction ? (
        <Pressable onPress={onAction} style={styles.textBtn} hitSlop={8}>
          <Text style={styles.textBtnText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function IconBox({ children, tone = 'forest', size = 44 }: { children: React.ReactNode; tone?: Tone; size?: number }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: `${TONE_COLOR[tone]}16` }]}>
      {children}
    </View>
  );
}

export function Button({ label, onPress, tone = 'primary', variant = 'solid', icon, small, style, disabled }: {
  label: string; onPress?: () => void; tone?: Tone; variant?: 'solid' | 'outline' | 'ghost'; icon?: React.ReactNode; small?: boolean; style?: ViewStyle; disabled?: boolean;
}) {
  const bg = variant === 'solid' ? (tone === 'primary' || tone === 'forest' ? C.forest : TONE_COLOR[tone]) : 'transparent';
  const fg = variant === 'solid' ? C.white : (tone === 'primary' || tone === 'forest' ? C.forest : TONE_COLOR[tone]);
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [
      styles.btn, { backgroundColor: bg, paddingVertical: small ? 9 : 12, paddingHorizontal: small ? 14 : 18, opacity: pressed || disabled ? 0.75 : 1 },
      variant !== 'solid' && { borderWidth: 1.5, borderColor: fg },
      style,
    ]}>
      {icon}
      <Text style={[styles.btnText, { color: fg, fontSize: small ? 13 : 14 }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({ name = 'Grace Akinyi', size = 38, tone = 'forest' }: { name?: string; size?: number; tone?: Tone }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: TONE_COLOR[tone] }]}><Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text></View>;
}

export function Empty({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

export function Kpi({ icon, label, value, sub, tone = 'primary', progress, badge }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; tone?: Tone; progress?: number; badge?: string;
}) {
  return (
    <Card style={styles.kpi}>
      <Row style={styles.kpiTop}>
        <IconBox tone={tone} size={40}>{icon}</IconBox>
        {badge ? <Badge label={badge} tone={tone} /> : null}
      </Row>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {progress !== undefined ? <Progress value={progress} tone={tone} /> : null}
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Card>
  );
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.header, width < 720 && { flexDirection: 'column', alignItems: 'flex-start' }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={{ marginTop: width < 720 ? 12 : 0 }}>{right}</View> : null}
    </View>
  );
}

export function InfoRow({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  return (
    <Row style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, tone && { color: TONE_COLOR[tone] }]}>{value}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, ...SHADOW.card },
  cardPad: { padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flexDirection: 'column' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  track: { width: '100%', borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%' },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 12 },
  eyebrow: { fontSize: 13, fontWeight: '800', color: C.primary, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 5 },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  sectionSub: { fontSize: 15, color: C.muted, marginTop: 4 },
  textBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  textBtnText: { color: C.primary, fontWeight: '700', fontSize: 15 },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.sm, gap: 8 },
  btnText: { fontWeight: '700' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontWeight: '800' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 36, gap: 8 },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  emptyText: { fontSize: 14, color: C.muted, textAlign: 'center', maxWidth: 280 },
  divider: { height: 1, backgroundColor: C.border, width: '100%' },
  kpi: { minWidth: 168, flex: 1, gap: 6 },
  kpiTop: { justifyContent: 'space-between', marginBottom: 4 },
  kpiLabel: { fontSize: 14, color: C.muted, fontWeight: '600' },
  kpiValue: { fontSize: 27, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  kpiSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.6 },
  headerSub: { fontSize: 15, color: C.muted, marginTop: 4 },
  infoRow: { justifyContent: 'space-between', paddingVertical: 7, gap: 12 },
  infoLabel: { fontSize: 14, color: C.muted },
  infoValue: { fontSize: 14, color: C.text, fontWeight: '700', textAlign: 'right', flexShrink: 1 },
});
