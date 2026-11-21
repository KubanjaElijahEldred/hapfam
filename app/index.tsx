import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Factory, Warehouse, FlaskConical, ShieldCheck, ArrowRight, Lock } from 'lucide-react-native';
import { ImageBackground } from 'expo-image';
import { C, DEPARTMENTS, RADIUS, SHADOW } from '../src/theme';
import { IMG } from '../src/assets';

const CARDS = [
  { dept: DEPARTMENTS.production, image: IMG.productionHero[1], icon: Factory, tone: C.primary, points: 'Orders · Batches · Consumption' },
  { dept: DEPARTMENTS.inventory, image: IMG.inventoryHero[0], icon: Warehouse, tone: C.info, points: 'Stock · Requests · Receiving' },
  { dept: DEPARTMENTS.quality, image: IMG.qualityHero[0], icon: FlaskConical, tone: '#6E56A8', points: 'Testing · Approvals · NCRs' },
  { dept: DEPARTMENTS.management, image: IMG.productionHero[1], icon: ShieldCheck, tone: C.forest, points: 'Announcements · Accounts · Audit' },
] as const;

export default function Launcher() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const cols = width >= 1150 ? 4 : width >= 720 ? 2 : 1;

  return (
    <LinearGradient colors={[C.cream, C.lemonSoft, C.cream]} style={s.root}>
      <View style={[s.page, { maxHeight: height }]}>
        <View style={s.top}>
          <View style={s.brand}>
            <View style={s.mark}><Leaf size={24} color={C.lemon} /></View>
            <View>
              <Text style={s.brandName}>HAPFAM <Text style={s.brandCo}>CO. LTD</Text></Text>
              <Text style={s.brandTag}>Good Food. Better Life.</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/login' as any)} style={s.signin}>
            <Lock size={15} color={C.white} /><Text style={s.signinText}>Secure sign in</Text>
          </Pressable>
        </View>

        <ImageBackground source={IMG.field} style={s.hero} contentFit="cover">
          <LinearGradient colors={['rgba(8,44,27,0.55)', 'rgba(8,44,27,0.86)']} style={s.heroShade} />
          <View style={s.heroContent}>
            <View style={s.heroEyebrow}><Text style={s.heroEyebrowText}>INTEGRATED MANUFACTURING MANAGEMENT INFORMATION SYSTEM</Text></View>
            <Text style={[s.heroTitle, { fontSize: width < 700 ? 26 : 38 }]}>One company. Four connected workspaces.</Text>
            <Text style={s.heroSub}>Production · Stores & Inventory · Quality Assurance · Management — sharing one live record store from raw material receipt to finished flour release.</Text>
          </View>
        </ImageBackground>

        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Choose your workspace</Text>
          <Text style={s.sectionSub}>Each department has its own dashboard, forms, permissions and live data.</Text>
        </View>

        <View style={s.grid}>
          {CARDS.map(card => {
            const I = card.icon;
            return (
              <Pressable key={card.dept.key} onPress={() => router.push(card.dept.route as any)} style={({ pressed }) => [s.card, { width: `${100 / cols}%` }, pressed && { opacity: 0.82 }]}>
                <ImageBackground source={card.image} style={s.cardImg} contentFit="cover">
                  <LinearGradient colors={['rgba(8,44,27,0.18)', 'rgba(8,44,27,0.92)']} style={s.cardShade} />
                  <View style={s.cardTop}><Text style={s.cardNo}>{card.dept.no === 'MGMT' ? 'MANAGEMENT' : `DEPARTMENT ${card.dept.no}`}</Text></View>
                  <View style={[s.cardIcon, { backgroundColor: card.tone }]}><I size={22} color={C.white} /></View>
                  <View style={s.cardText}>
                    <Text style={s.cardName}>{card.dept.name}</Text>
                    <Text style={s.cardPoints}>{card.points}</Text>
                  </View>
                </ImageBackground>
                <View style={s.cardFoot}><Text style={s.enter}>Open workspace</Text><ArrowRight size={16} color={card.tone} /></View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.flow}>
          <Text style={s.flowLabel}>Receive stock → Request materials → Manufacture → Inspect & decide → Release finished goods</Text>
          <Text style={s.flowNote}>All events are recorded and every department is notified.</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  page: { width: '100%', maxWidth: 1400, alignSelf: 'center', paddingHorizontal: 26, paddingTop: 16, paddingBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  mark: { width: 40, height: 40, borderRadius: 11, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: C.forest, fontSize: 22, fontWeight: '800', letterSpacing: 1.4 },
  brandCo: { color: C.muted, fontWeight: '600' },
  brandTag: { color: C.muted, fontSize: 14, marginTop: 2 },
  signin: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.forest, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 10 },
  signinText: { color: C.white, fontSize: 15, fontWeight: '800' },
  hero: { height: 158, borderRadius: RADIUS.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  heroShade: { position: 'absolute', inset: 0 },
  heroContent: { padding: 22 },
  heroEyebrow: { alignSelf: 'flex-start', backgroundColor: C.lemon, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8 },
  heroEyebrowText: { color: C.deep, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: C.white, fontWeight: '800', lineHeight: 44, letterSpacing: -0.7 },
  heroSub: { color: '#DDEBE0', fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: 760 },
  sectionHead: { marginTop: 14, marginBottom: 10 },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  sectionSub: { fontSize: 14, color: C.muted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: C.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, overflow: 'hidden', flexGrow: 1, ...SHADOW.card },
  cardImg: { height: 148, padding: 12, justifyContent: 'space-between' },
  cardShade: { position: 'absolute', inset: 0 },
  cardTop: { position: 'relative' },
  cardNo: { color: C.lemon, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  cardIcon: { position: 'absolute', right: 10, top: 8, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardText: { position: 'relative' },
  cardName: { color: C.white, fontSize: 18, fontWeight: '800' },
  cardPoints: { color: '#DDEBE0', fontSize: 13, marginTop: 2 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9 },
  enter: { fontSize: 14, fontWeight: '800', color: C.forest },
  flow: { marginTop: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  flowLabel: { fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'center' },
  flowNote: { fontSize: 13, color: C.muted, marginTop: 2 },
});
