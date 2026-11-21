import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2, XCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { C, RADIUS } from '../src/theme';
import { IMG } from '../src/assets';
import { auth, setToken } from '../src/services/backend';

const DEMO_PASSWORD = 'Hapfam@2026Secure';
const DEMO = [
  { label: 'Manager', email: 'manager@hapfam.co.ug', route: '/management/dashboard', color: C.forest },
  { label: 'Production', email: 'production@hapfam.co.ug', route: '/production/dashboard', color: C.primary },
  { label: 'Inventory', email: 'inventory@hapfam.co.ug', route: '/inventory/dashboard', color: C.info },
  { label: 'Quality', email: 'quality@hapfam.co.ug', route: '/quality/dashboard', color: '#6E56A8' },
];

const rules = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError('Email and password are required.'); return; }
    setBusy(true); setError('');
    try {
      const user = await auth.login(email, password);
      const route = user.department === 'management' ? '/management/dashboard'
        : `/${user.department}/dashboard`;
      router.push(route as any);
    } catch (e: any) {
      setError(e.message || 'Sign in failed. Is the API running?');
    } finally { setBusy(false); }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.scroll}>
      <View style={s.brand}>
        <View style={s.mark}><Leaf size={22} color={C.fresh} /></View>
        <View><Text style={s.brandName}>HAPFAM CO. LTD</Text><Text style={s.brandTag}>Good Food. Better Life.</Text></View>
      </View>

      <View style={s.cardWrap}>
        <View style={s.hero}>
          <Image source={IMG.field} style={s.heroImg} contentFit="cover" />
          <View style={s.heroShade} />
          <View style={s.heroText}>
            <BadgeText>Secure workspace access</BadgeText>
            <Text style={s.heroTitle}>Welcome back</Text>
            <Text style={s.heroSub}>Sign in to your departmental workspace.</Text>
          </View>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email address</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
            placeholder="name@hapfam.co.ug" placeholderTextColor={C.muted} style={s.input} />
          <Text style={s.label}>Password</Text>
          <View style={s.passRow}>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry={!show}
              placeholder="Enter your password" placeholderTextColor={C.muted} style={[s.input, { flex: 1, borderWidth: 0 }]} />
            <Pressable onPress={() => setShow(v => !v)} hitSlop={8}><EyeOff size={18} color={C.muted} /></Pressable>
          </View>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [s.submit, pressed && { opacity: 0.8 }]}>
            <Text style={s.submitText}>{busy ? 'Signing in…' : 'Sign in securely'}</Text>
            <ArrowRight size={17} color={C.white} />
          </Pressable>

          <View style={s.policy}>
            <Row><ShieldCheck size={15} color={C.primary} /><Text style={s.policyTitle}>Strong password policy</Text></Row>
            {rules.map(r => {
              const ok = r.test(password);
              return (
                <Row key={r.label} style={s.rule}>
                  {ok ? <CheckCircle2 size={13} color={C.primary} /> : <XCircle size={13} color={C.muted} />}
                  <Text style={[s.ruleText, ok && { color: C.primary }]}>{r.label}</Text>
                </Row>
              );
            })}
          </View>

          <Text style={s.demoHead}>Demo accounts · password: {DEMO_PASSWORD}</Text>
          <View style={s.demoGrid}>
            {DEMO.map(d => (
              <Pressable key={d.label} onPress={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); }}
                style={({ pressed }) => [s.demoBtn, pressed && { opacity: 0.75 }]}>
                <View style={[s.demoDot, { backgroundColor: d.color }]} />
                <Text style={s.demoText}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.push('/' as any)} style={s.back}><Text style={s.backText}>Back to department selector</Text></Pressable>
        </View>
      </View>
      <Text style={s.footer}>HAPFAM Co. Ltd · Integrated Manufacturing MIS · Demonstration credentials</Text>
    </ScrollView>
  );
}

function BadgeText({ children }: { children: React.ReactNode }) {
  return <View style={s.badge}><Text style={s.badgeText}>{String(children).toUpperCase()}</Text></View>;
}
const Row = ({ children, style }: { children: React.ReactNode; style?: any }) => <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 7 }, style]}>{children}</View>;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  scroll: { padding: 20, paddingBottom: 40 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 },
  mark: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.forest, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: C.forest, fontSize: 17, fontWeight: '800', letterSpacing: 1.2 },
  brandTag: { color: C.muted, fontSize: 10, marginTop: 2 },
  cardWrap: { backgroundColor: C.white, borderRadius: RADIUS.xl, overflow: 'hidden', maxWidth: 940, width: '100%', alignSelf: 'center', borderWidth: 1, borderColor: C.border },
  hero: { height: 190 },
  heroImg: { width: '100%', height: '100%' },
  heroShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,44,27,0.66)' },
  heroText: { position: 'absolute', left: 26, bottom: 24 },
  badge: { alignSelf: 'flex-start', backgroundColor: C.fresh, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  badgeText: { color: C.deep, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: C.white, fontSize: 28, fontWeight: '800' },
  heroSub: { color: '#DDEBE0', fontSize: 12, marginTop: 4 },
  form: { padding: 26 },
  label: { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 7, marginTop: 12 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, height: 46, paddingHorizontal: 13, fontSize: 13, color: C.text, backgroundColor: C.white },
  passRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingHorizontal: 12 },
  error: { color: C.danger, fontSize: 12, marginTop: 10, fontWeight: '600' },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.forest, borderRadius: RADIUS.sm, paddingVertical: 14, marginTop: 20 },
  submitText: { color: C.white, fontSize: 14, fontWeight: '800' },
  policy: { marginTop: 22, backgroundColor: C.cream, borderRadius: RADIUS.md, padding: 14 },
  policyTitle: { fontSize: 12, fontWeight: '800', color: C.text },
  rule: { marginTop: 7 },
  ruleText: { fontSize: 11, color: C.muted },
  demoHead: { fontSize: 11, color: C.muted, marginTop: 20, marginBottom: 9 },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: C.white },
  demoDot: { width: 7, height: 7, borderRadius: 4 },
  demoText: { fontSize: 11, color: C.text, fontWeight: '700' },
  back: { marginTop: 18, alignItems: 'center' },
  backText: { color: C.primary, fontSize: 12, fontWeight: '700' },
  footer: { textAlign: 'center', color: C.muted, fontSize: 10, marginTop: 18 },
});
