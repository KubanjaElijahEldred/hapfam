import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Image } from 'expo-image';
import {
  Leaf, Factory, Warehouse, FlaskConical, ShieldCheck, ArrowRight, Lock,
  CheckCircle2, Radio, Sparkles,
} from 'lucide-react-native';
import { C, DEPARTMENTS, RADIUS, SHADOW } from '../src/theme';
import { IMG } from '../src/assets';

const WORKSPACES = [
  { dept: DEPARTMENTS.production, icon: Factory, tone: C.primary, caption: 'Orders · Batches · Consumption' },
  { dept: DEPARTMENTS.inventory, icon: Warehouse, tone: C.info, caption: 'Stock · Requests · Receiving' },
  { dept: DEPARTMENTS.quality, icon: FlaskConical, tone: '#7C64B0', caption: 'Testing · Approvals · NCRs' },
  { dept: DEPARTMENTS.management, icon: ShieldCheck, tone: C.forest, caption: 'Announcements · Accounts · Audit' },
] as const;

const PRODUCTS = [
  { image: IMG.productSoya, name: 'Soya', color: '#E9A23B' },
  { image: IMG.productRice, name: 'Rice', color: '#F5E9C8' },
  { image: IMG.productMaize, name: 'Maize', color: C.fresh },
] as const;

function Entrance({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    const t = setTimeout(() => Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start(), delay);
    return () => clearTimeout(t);
  }, [anim, delay]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export default function Launcher() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = width < 900;
  const cols = width >= 1200 ? 4 : width >= 760 ? 2 : 1;

  return (
    <LinearGradient colors={[C.cream, '#F4F9E7', '#E9F5CC']} style={s.root}>
      <View style={[s.page, { maxHeight: height }]}>
        {/* Header */}
        <View style={s.top}>
          <View style={s.brand}>
            <View style={s.mark}><Leaf size={24} color={C.lemon} strokeWidth={2.6} /></View>
            <View>
              <Text style={s.brandName}>HAPFAM <Text style={s.brandCo}>CO. LTD</Text></Text>
              <Text style={s.brandTag}>Good Food. Better Life.</Text>
            </View>
          </View>
          <View style={s.actions}>
            <View style={s.live}><Radio size={14} color={C.lemon} /><Text style={s.liveText}>SYSTEM ONLINE</Text></View>
            <Pressable onPress={() => router.push('/login' as any)} style={({ pressed }) => [s.signin, pressed && { opacity: 0.8 }]}>
              <Lock size={15} color={C.white} /><Text style={s.signinText}>Secure sign in</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero */}
        <Entrance delay={60}>
          <ImageBackground source={IMG.field} style={[s.hero, { height: compact ? 210 : 250 }]} contentFit="cover">
            <LinearGradient colors={['rgba(8,44,27,0.72)', 'rgba(8,44,27,0.92)']} style={s.heroShade} />
            <View style={[s.heroInner, compact && { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={{ flex: 1.25, minWidth: 0 }}>
                <View style={s.eyebrow}><Sparkles size={13} color={C.deep} /><Text style={s.eyebrowText}>INTEGRATED MANUFACTURING INTELLIGENCE</Text></View>
                <Text style={[s.heroTitle, { fontSize: compact ? 30 : 42 }]}>Good Food. Better Life.</Text>
                <Text style={s.heroSub}>One connected platform for Production, Stores & Inventory, Quality Assurance and Management — from raw material receipt to finished porridge flour release.</Text>
                <View style={s.productPills}>
                  {PRODUCTS.map(p => (
                    <View key={p.name} style={s.productPill}>
                      <View style={[s.productDot, { backgroundColor: p.color }]} />
                      <Text style={s.productPillText}>{p.name} Porridge Flour</Text>
                    </View>
                  ))}
                </View>
              </View>
              {!compact ? (
                <View style={s.showcase}>
                  {PRODUCTS.map((p, i) => (
                    <Animated.View key={p.name} style={[s.showItem, { marginLeft: i === 0 ? 0 : -34, zIndex: 3 - i }]}>
                      <View style={s.showGlow} />
                      <Image source={p.image} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                      <View style={s.showLabel}><Text style={s.showLabelText}>{p.name.toUpperCase()}</Text></View>
                    </Animated.View>
                  ))}
                </View>
              ) : null}
            </View>
          </ImageBackground>
        </Entrance>

        {/* Workspace section */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>Choose your workspace</Text>
              <Text style={s.sectionSub}>Four dedicated environments · one shared live record store</Text>
            </View>
            <View style={s.feature}><CheckCircle2 size={14} color={C.primary} /><Text style={s.featureText}>Cross-department workflow active</Text></View>
          </View>

          <View style={s.grid}>
            {WORKSPACES.map((w, i) => {
              const I = w.icon;
              return (
                <Entrance key={w.dept.key} delay={i * 55} style={{ width: `${100 / cols}%`, paddingHorizontal: 5, paddingBottom: 8 }}>
                  <Pressable onPress={() => router.push(`/login?next=${encodeURIComponent(w.dept.route)}` as any)} style={({ pressed }) => [s.card, pressed && { opacity: 0.82, transform: [{ scale: 0.985 }] }]}>
                    <View style={[s.cardMain, { backgroundColor: w.dept.key === 'quality' ? '#16103A' : C.deep }]}>
                      <View style={[s.cardIcon, { backgroundColor: w.tone }]}><I size={22} color={C.white} strokeWidth={2.2} /></View>
                      <Text style={s.cardNo}>{w.dept.no === 'MGMT' ? 'MANAGEMENT' : `DEPARTMENT ${w.dept.no}`}</Text>
                      <Text style={s.cardName}>{w.dept.name}</Text>
                      <Text style={s.cardCaption}>{w.caption}</Text>
                      <View style={[s.cardAccent, { backgroundColor: w.tone }]} />
                    </View>
                    <View style={s.cardFoot}><Text style={s.enter}>Open workspace</Text><ArrowRight size={16} color={w.tone} /></View>
                  </Pressable>
                </Entrance>
              );
            })}
          </View>
        </View>

        {/* Workflow strip */}
        <Entrance delay={460}>
          <View style={s.flow}>
            {['Goods received', 'Material issued', 'Batch manufactured', 'Quality decision', 'Finished stock'].map((step, i) => (
              <React.Fragment key={step}>
                <View style={s.flowStep}>
                  <View style={[s.flowNum, { backgroundColor: i === 4 ? C.fresh : 'rgba(255,255,255,0.14)' }]}>
                    <Text style={[s.flowNumText, i === 4 && { color: C.deep }]}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <Text style={s.flowLabel}>{step}</Text>
                </View>
                {i < 4 ? <View style={s.flowLine} /> : null}
              </React.Fragment>
            ))}
          </View>
        </Entrance>

        <View style={s.stats}>
          {[
            ['01', 'Shared database'],
            ['02', 'Role-based access'],
            ['03', 'Live notifications'],
            ['04', 'Full audit trail'],
          ].map(([n, label]) => (
            <View key={n} style={s.statItem}>
              <Text style={s.statNum}>{n}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  page: { width: '100%', maxWidth: 1400, alignSelf: 'center', paddingHorizontal: 26, paddingTop: 14, paddingBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  mark: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(199,240,74,0.35)' },
  brandName: { color: C.forest, fontSize: 19, fontWeight: '800', letterSpacing: 1.3 },
  brandCo: { color: C.muted, fontWeight: '600' },
  brandTag: { color: C.muted, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.deep, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 8 },
  liveText: { color: C.lemon, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  signin: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.primary, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 10 },
  signinText: { color: C.white, fontSize: 13, fontWeight: '800' },
  hero: { borderRadius: RADIUS.lg, overflow: 'hidden', justifyContent: 'center' },
  heroShade: { position: 'absolute', inset: 0 },
  heroInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, gap: 20 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.lemon, borderRadius: RADIUS.pill, paddingHorizontal: 11, paddingVertical: 6, marginBottom: 10 },
  eyebrowText: { color: C.deep, fontSize: 9.5, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: C.white, fontWeight: '800', letterSpacing: -1.2, lineHeight: 46 },
  heroSub: { color: '#DDEBE0', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 640 },
  productPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  productPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', borderRadius: RADIUS.pill, paddingHorizontal: 11, paddingVertical: 6 },
  productDot: { width: 7, height: 7, borderRadius: 4 },
  productPillText: { color: C.white, fontSize: 11, fontWeight: '700' },
  showcase: { flex: 0.75, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%' },
  showItem: { width: 118, height: 158, borderRadius: RADIUS.md, backgroundColor: 'rgba(8,44,27,0.55)', borderWidth: 1, borderColor: 'rgba(199,240,74,0.35)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  showGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(199,240,74,0.18)' },
  showLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.deep, alignItems: 'center', paddingVertical: 5 },
  showLabelText: { color: C.lemon, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  section: { marginTop: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  sectionSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: C.border, paddingHorizontal: 11, paddingVertical: 6 },
  featureText: { fontSize: 11, color: C.forest, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginHorizontal: -5 },
  card: { backgroundColor: C.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, overflow: 'hidden', width: '100%', ...SHADOW.card },
  cardMain: { padding: 14, height: 145 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardNo: { color: C.lemon, fontSize: 9.5, fontWeight: '800', letterSpacing: 1 },
  cardName: { color: C.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  cardCaption: { color: '#CFE3D5', fontSize: 11, marginTop: 3 },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, paddingVertical: 9 },
  enter: { fontSize: 12, fontWeight: '800', color: C.forest },
  flow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.deep, borderRadius: RADIUS.md, paddingHorizontal: 18, paddingVertical: 11, marginTop: 12, flexWrap: 'wrap', gap: 8 },
  flowStep: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  flowNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flowNumText: { color: C.lemon, fontSize: 10, fontWeight: '800' },
  flowLabel: { color: C.white, fontSize: 11, fontWeight: '700' },
  flowLine: { height: 1, width: 26, backgroundColor: 'rgba(199,240,74,0.45)', marginHorizontal: 6 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(16,61,40,0.12)', flexWrap: 'wrap', gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statNum: { color: C.primary, fontSize: 12, fontWeight: '800' },
  statLabel: { color: C.muted, fontSize: 11, fontWeight: '700' },
});
