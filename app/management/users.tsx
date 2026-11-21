import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { UserPlus, ShieldCheck, CheckCircle2, XCircle, KeyRound } from 'lucide-react-native';
import { DepartmentShell } from '../../src/components/Shell';
import { Card, Header, Badge, Row, SectionHead, Button } from '../../src/components/ui';
import { auth } from '../../src/services/backend';
import { C, RADIUS, DEPARTMENTS } from '../../src/theme';
import type { Dept } from '../../src/types';

const RULES = [
  { label: 'At least 12 characters', ok: (p: string) => p.length >= 12 },
  { label: 'Uppercase letter', ok: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', ok: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', ok: (p: string) => /\d/.test(p) },
  { label: 'Symbol', ok: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Page() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState<Dept>('production');
  const [role, setRole] = useState('Production Manager');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const roles: Record<string, string> = {
    production: 'Production Manager',
    inventory: 'Store Keeper',
    quality: 'Quality Assurance Officer',
  };

  const submit = async () => {
    setError(''); setMessage('');
    if (!name || !email || !password) { setError('All fields are required.'); return; }
    if (!RULES.every(r => r.ok(password))) { setError('Password does not meet the strong-password policy.'); return; }
    setBusy(true);
    try {
      await auth.register({ name, email, password, role, department });
      setMessage(`${name} was created as ${role} for ${DEPARTMENTS[department].name}.`);
      setName(''); setEmail(''); setPassword('');
    } catch (e: any) { setError(e.message || 'Could not create account.'); }
    finally { setBusy(false); }
  };

  return (
    <DepartmentShell dept="management">
      <ScrollView>
        <Header title="Department Accounts" subtitle="Only Management can create department heads. Strong passwords are enforced." />
        <View style={layout}>
          <Card>
            <SectionHead eyebrow="User provisioning" title="Create a Department Head" subtitle="The new account can immediately sign in to its own workspace." />
            <Text style={label}>Full name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Daniel Ochieng" placeholderTextColor={C.muted} style={input} />
            <Text style={label}>Email address</Text>
            <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@hapfam.co.ug" placeholderTextColor={C.muted} style={input} />
            <Text style={label}>Department</Text>
            <Row style={pills}>
              {(['production', 'inventory', 'quality'] as Dept[]).map(d => (
                <Pressable key={d} onPress={() => { setDepartment(d); setRole(roles[d]); }} style={[pill, department === d && pillOn]}>
                  <Text style={[pillText, department === d && pillTextOn]}>{DEPARTMENTS[d].name}</Text>
                </Pressable>
              ))}
            </Row>
            <Text style={label}>Role</Text>
            <TextInput value={role} onChangeText={setRole} style={input} />
            <Text style={label}>Temporary strong password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 12 characters" placeholderTextColor={C.muted} style={input} />
            <View style={rules}>
              {RULES.map(r => (
                <Row key={r.label} style={rule}>
                  {r.ok(password) ? <CheckCircle2 size={14} color={C.primary} /> : <XCircle size={14} color={C.muted} />}
                  <Text style={[ruleText, r.ok(password) && { color: C.primary }]}>{r.label}</Text>
                </Row>
              ))}
            </View>
            {error ? <Text style={errorText}>{error}</Text> : null}
            {message ? <Text style={okText}>{message}</Text> : null}
            <View style={submitRow}>
              <Button label={busy ? 'Creating…' : 'Create account'} icon={<UserPlus size={16} color={C.white} />} onPress={submit} disabled={busy} />
            </View>
          </Card>

          <Card>
            <SectionHead eyebrow="Security" title="Password policy" subtitle="Enforced by the backend for every new account." />
            <View style={policyRow}><KeyRound size={18} color={C.primary} /><Text style={policyText}>Minimum 12 characters with uppercase, lowercase, number and symbol.</Text></View>
            <View style={policyRow}><ShieldCheck size={18} color={C.primary} /><Text style={policyText}>Passwords are bcrypt-hashed. Access uses signed JWT tokens.</Text></View>
            <View style={policyRow}><UserPlus size={18} color={C.primary} /><Text style={policyText}>Only the Manager role can provision new department heads.</Text></View>
            <Badge label="Manager-only action" tone="forest" />
          </Card>
        </View>
      </ScrollView>
    </DepartmentShell>
  );
}

const layout = { flexDirection: 'row' as const, gap: 14, flexWrap: 'wrap' as const };
const label = { fontSize: 16, fontWeight: '700' as const, color: C.text, marginTop: 14, marginBottom: 7 };
const input = { borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, height: 48, paddingHorizontal: 14, fontSize: 16, color: C.text, backgroundColor: C.white };
const pills = { gap: 8, flexWrap: 'wrap' as const };
const pill = { paddingHorizontal: 13, paddingVertical: 9, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: C.border, backgroundColor: C.white };
const pillOn = { backgroundColor: C.forest, borderColor: C.forest };
const pillText = { fontSize: 15, color: C.muted, fontWeight: '700' as const };
const pillTextOn = { color: C.white };
const rules = { marginTop: 14, backgroundColor: C.cream, borderRadius: RADIUS.md, padding: 12 };
const rule = { marginTop: 6 };
const ruleText = { fontSize: 15, color: C.muted };
const errorText = { color: C.danger, fontSize: 15, marginTop: 12, fontWeight: '600' as const };
const okText = { color: C.primary, fontSize: 15, marginTop: 12, fontWeight: '600' as const };
const submitRow = { marginTop: 18 };
const policyRow = { flexDirection: 'row' as const, gap: 10, alignItems: 'flex-start' as const, marginBottom: 14 };
const policyText = { flex: 1, fontSize: 15, color: C.text, lineHeight: 22 };
