import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { Leaf, Factory, Warehouse, FlaskConical, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { C, DEPARTMENTS, RADIUS, SHADOW } from '../src/theme';
import { IMG } from '../src/assets';

const CARDS = [
  { dept: DEPARTMENTS.production, image: IMG.productionHero[0], icon: Factory, tone: C.primary, points: ['Orders & planning', 'Batch traceability', 'Material consumption'] },
  { dept: DEPARTMENTS.inventory, image: IMG.inventoryHero[0], icon: Warehouse, tone: C.info, points: ['Raw materials', 'Goods receiving', 'Finished goods'] },
  { dept: DEPARTMENTS.quality, image: IMG.qualityHero[0], icon: FlaskConical, tone: '#6E56A8', points: ['Lab inspections', 'Approvals & holds', 'Non-conformance'] },
  { dept: DEPARTMENTS.management, image: IMG.productionHero[1], icon: ShieldCheck, tone: C.forest, points: ['Announcements', 'Replies by department', 'Audit trail'] },
] as const;

export default function Launcher() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll}>
      <View style={s.top}>
        <View style={s.brand}>
          <View style={s.mark}><Leaf size={22} color={C.fresh} /></View>
          <View>
            <Text style={s.brandName}>HAPFAM <Text style={s.brandCo}>CO. LTD</Text></Text>
            <Text style={s.brandTag}>Good Food. Better Life.</Text>
          </View>
        </View>
        <View style={s.systemTag}><ShieldCheck size={14} color={C.fresh} /><Text style={s.systemText}>Integrated Manufacturing MIS</Text></View>
        <Pressable onPress={() => router.push('/login' as any)} style={s.signinBtn}><Text style={s.signinText}>Sign in securely</Text></Pressable>
      </View>

      <ImageBackground source={IMG.field} style={s.hero} contentFit="cover">
        <View style={s.heroShade} />
        <View style={s.heroContent}>
          <View style={s.heroEyebrow}><Text style={s.heroEyebrowText}>MANUFACTURING MANAGEMENT INFORMATION SYSTEM</Text></View>
          <Text style={[s.heroTitle, { fontSize: width < 700 ? 32 : 50 }]}>One company. Three connected{'\n'}workspaces.</Text>
          <Text style={s.heroSub}>Select a department to enter its dedicated workspace. Every action flows through one shared record store — from raw material receipt to finished flour release.</Text>
          <View style={s.heroPills}>
            <Text style={s.heroPill}>Soya Porridge Flour</Text>
            <Text style={s.heroPill}>Rice Porridge Flour</Text>
            <Text style={s.heroPill}>Maize Porridge Flour</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Choose your workspace</Text>
        <Text style={s.sectionSub}>Each department has its own dashboard, navigation, forms and permissions.</Text>
      </View>

      <View style={s.grid}>
        {CARDS.map(card => {
          const I = card.icon;
          return (
            <Pressable key={card.dept.key} onPress={() => router.push(card.dept.route as any)} style={({ pressed }) => [s.card, { width: `${100 / cols}%` }, pressed && { opacity: 0.85 }]}>
              <View style={s.cardImgWrap}>
                <ImageBackground source={card.image} style={s.cardImg} contentFit="cover">
                  <View style={[s.cardShade, { backgroundColor: `${C.deep}B3` }]} />
                  <View style={s.cardNo}><Text style={s.cardNoText}>DEPARTMENT {card.dept.no}</Text></View>
                  <View style={[s.cardIcon, { backgroundColor: card.tone }]}><I size={22} color={C.white} /></View>
                </ImageBackground>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardName}>{card.dept.full}</Text>
                <Text style={s.cardDesc}>{card.dept.sub}</Text>
                {card.points.map(p => (
                  <Row key={p}><View style={[s.tick, { backgroundColor: `${card.tone}22` }]}><View style={[s.tickDot, { backgroundColor: card.tone }]} /></View><Text style={s.point}>{p}</Text></Row>
                ))}
                <View style={s.cardFoot}><Text style={s.enter}>Enter workspace</Text><ArrowRight size={16} color={card.tone} /></View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={s.flow}>
        <Text style={s.flowTitle}>One connected manufacturing flow</Text>
        <Text style={s.flowSub}>Inventory receives stock → Production manufactures → Quality decides → Inventory releases.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.flowRow}>
          {['Goods received', 'Material issued', 'Batch created', 'Inspection', 'Quality decision', 'Finished stock'].map((x, i) => (
            <React.Fragment key={x}>
              <View style={s.flowStep}><Text style={s.flowNum}>{String(i + 1).padStart(2, '0')}</Text><Text style={s.flowLabel}>{x}</Text></View>
              {i < 5 ? <ChevronRight size={16} color={C.muted} style={{ marginHorizontal: 8, marginTop: 12 }} /> : null}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      <Text style={s.footer}>HAPFAM Co. Ltd · Good Food. Better Life. · Demonstration data</Text>
    </ScrollView>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 7 }}>{children}</View>;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  scroll: { paddingBottom: 40 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingTop: 24, paddingBottom: 18, flexWrap: 'wrap', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  mark: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: C.forest, fontSize: 19, fontWeight: '800', letterSpacing: 1.5 },
  brandCo: { color: C.muted, fontWeight: '600' },
  brandTag: { color: C.muted, fontSize: 10, marginTop: 2 },
  systemTag: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 8 },
  systemText: { color: C.forest, fontSize: 11, fontWeight: '700' },
  signinBtn: { backgroundColor: C.forest, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 9 },
  signinText: { color: C.white, fontSize: 11, fontWeight: '800' },
  hero: { marginHorizontal: 28, height: 380, borderRadius: RADIUS.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  heroShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,44,27,0.62)' },
  heroContent: { padding: 36, maxWidth: 760 },
  heroEyebrow: { alignSelf: 'flex-start', backgroundColor: C.fresh, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  heroEyebrowText: { color: C.deep, fontSize: 9.5, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { color: C.white, fontWeight: '800', lineHeight: 1.12, letterSpacing: -1 },
  heroSub: { color: '#DDEBE0', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 620 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  heroPill: { color: C.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 6, fontSize: 10, fontWeight: '700' },
  sectionHead: { paddingHorizontal: 28, marginTop: 34, marginBottom: 18 },
  sectionTitle: { fontSize: 23, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  sectionSub: { fontSize: 12.5, color: C.muted, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 22 },
  card: { backgroundColor: C.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, marginHorizontal: 6, marginBottom: 14, overflow: 'hidden', ...SHADOW.card },
  cardImgWrap: { height: 150 },
  cardImg: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 15 },
  cardShade: { position: 'absolute', inset: 0 },
  cardNo: { position: 'absolute', top: 13, left: 15 },
  cardNoText: { color: '#C7E2CE', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  cardIcon: { position: 'absolute', right: 15, bottom: 14, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 17 },
  cardName: { fontSize: 16, fontWeight: '800', color: C.text },
  cardDesc: { fontSize: 11, color: C.muted, marginTop: 4, marginBottom: 12 },
  tick: { width: 16, height: 16, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  tickDot: { width: 5, height: 5, borderRadius: 3 },
  point: { fontSize: 11, color: C.text },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, marginTop: 15, paddingTop: 13 },
  enter: { fontSize: 12, fontWeight: '800', color: C.forest },
  flow: { margin: 28, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.lg, padding: 20 },
  flowTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  flowSub: { fontSize: 11, color: C.muted, marginTop: 4, marginBottom: 16 },
  flowRow: { flexDirection: 'row' },
  flowStep: { minWidth: 120, backgroundColor: C.cream, borderRadius: RADIUS.md, padding: 12 },
  flowNum: { fontSize: 11, color: C.primary, fontWeight: '800' },
  flowLabel: { fontSize: 11, color: C.text, fontWeight: '700', marginTop: 5 },
  footer: { textAlign: 'center', color: C.muted, fontSize: 10, marginTop: 8 },
});
