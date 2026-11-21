import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Modal } from 'react-native';
import { Search, X, Plus, ChevronDown } from 'lucide-react-native';
import { C, RADIUS, SHADOW } from '../theme';
import { Button, Card, Empty, Badge } from './ui';

export type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  initial?: string;
};

export function FormModal({ visible, title, subtitle, fields, onClose, onSubmit, submitLabel = 'Save' }: {
  visible: boolean; title: string; subtitle?: string; fields: Field[];
  onClose: () => void; onSubmit: (v: Record<string, string>) => void; submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  React.useEffect(() => {
    if (visible) {
      const v: Record<string, string> = {};
      fields.forEach(f => { v[f.key] = f.initial ?? ''; });
      setValues(v); setError('');
    }
  }, [visible, fields]);

  const submit = () => {
    const missing = fields.find(f => f.required && !String(values[f.key] || '').trim());
    if (missing) { setError(`${missing.label} is required.`); return; }
    onSubmit(values);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={f.backdrop} onPress={onClose} />
      <View style={f.sheet}>
        <View style={f.head}>
          <View style={{ flex: 1 }}>
            <Text style={f.title}>{title}</Text>
            {subtitle ? <Text style={f.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable onPress={onClose} hitSlop={8}><X size={20} color={C.muted} /></Pressable>
        </View>
        <ScrollView style={f.body} contentContainerStyle={f.bodyPad} keyboardShouldPersistTaps="handled">
          {fields.map(field => (
            <View key={field.key} style={f.field}>
              <Text style={f.label}>{field.label}{field.required ? ' *' : ''}</Text>
              {field.type === 'select' ? (
                <View style={f.options}>
                  {(field.options || []).map(o => (
                    <Pressable key={o.value} onPress={() => setValues(v => ({ ...v, [field.key]: o.value }))}
                      style={[f.option, values[field.key] === o.value && f.optionOn]}>
                      <Text style={[f.optionText, values[field.key] === o.value && f.optionTextOn]}>{o.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : field.type === 'textarea' ? (
                <TextInput multiline value={values[field.key] || ''} onChangeText={x => setValues(v => ({ ...v, [field.key]: x }))}
                  placeholder={field.placeholder} placeholderTextColor={C.muted} style={[f.input, f.textarea]} />
              ) : (
                <TextInput value={values[field.key] || ''} onChangeText={x => setValues(v => ({ ...v, [field.key]: x }))}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  placeholder={field.placeholder} placeholderTextColor={C.muted} style={f.input} />
              )}
            </View>
          ))}
          {error ? <Text style={f.error}>{error}</Text> : null}
        </ScrollView>
        <View style={f.foot}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label={submitLabel} onPress={submit} />
        </View>
      </View>
    </Modal>
  );
}

export type Column = { key: string; label: string; flex?: number; width?: number; render?: (row: any) => React.ReactNode };

export function DataTable({ columns, rows, onRowPress, searchable = true, query, onQuery, emptyTitle = 'No records found', emptyText, action, badge }: {
  columns: Column[]; rows: any[]; onRowPress?: (row: any) => void; searchable?: boolean;
  query?: string; onQuery?: (q: string) => void; emptyTitle?: string; emptyText?: string;
  action?: React.ReactNode; badge?: React.ReactNode;
}) {
  const [local, setLocal] = useState('');
  const q = query !== undefined ? query : local;
  const setQ = (x: string) => { if (onQuery) onQuery(x); else setLocal(x); };
  const filtered = q ? rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q.toLowerCase()))) : rows;

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View style={t.toolbar}>
        <View style={{ flex: 1 }}>
          <Text style={t.tableTitle}>Records <Text style={t.count}>{filtered.length}</Text></Text>
        </View>
        {badge}
        {action}
        {searchable ? (
          <View style={t.search}>
            <Search size={15} color={C.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search…" placeholderTextColor={C.muted} style={t.searchInput} />
            {q ? <Pressable onPress={() => setQ('')} hitSlop={6}><X size={14} color={C.muted} /></Pressable> : null}
          </View>
        ) : null}
      </View>
      {filtered.length === 0 ? <Empty title={emptyTitle} text={emptyText} /> : (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={t.table}>
            <View style={t.headRow}>
              {columns.map(c => <View key={c.key} style={[t.headCell, { flex: c.flex || 1, width: c.width }]}><Text style={t.headText}>{c.label}</Text></View>)}
            </View>
            {filtered.map((row, i) => (
              <Pressable key={row.id || i} onPress={() => onRowPress?.(row)} style={({ pressed }) => [t.row, i % 2 === 1 && t.rowAlt, pressed && { opacity: 0.7 }]}>
                {columns.map(c => (
                  <View key={c.key} style={[t.cell, { flex: c.flex || 1, width: c.width }]}>
                    {c.render ? c.render(row) : <Text style={t.cellText} numberOfLines={1}>{String(row[c.key] ?? '—')}</Text>}
                  </View>
                ))}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </Card>
  );
}

export function FilterPills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
      {options.map(o => (
        <Pressable key={o} onPress={() => onChange(o)} style={[p.pill, value === o && p.pillOn]}>
          <Text style={[p.pillText, value === o && p.pillTextOn]}>{o}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function StatChips({ items }: { items: { label: string; value: string; tone?: 'success' | 'warning' | 'danger' | 'info' }[] }) {
  return (
    <View style={chips.wrap}>
      {items.map((x, i) => (
        <View key={x.label} style={[chips.chip, i === items.length - 1 && { marginRight: 0 }]}>
          <Text style={chips.value}>{x.value}</Text>
          <Text style={chips.label}>{x.label}</Text>
        </View>
      ))}
    </View>
  );
}

const f = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,32,20,0.45)' },
  sheet: { position: 'absolute', top: '8%', alignSelf: 'center', width: '92%', maxWidth: 620, maxHeight: '84%', backgroundColor: C.white, borderRadius: RADIUS.xl, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderColor: C.border },
  title: { fontSize: 21, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 4 },
  body: { maxHeight: 460 },
  bodyPad: { padding: 20 },
  field: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: C.border, backgroundColor: C.white, borderRadius: RADIUS.sm, paddingHorizontal: 13, height: 44, fontSize: 15, color: C.text },
  textarea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  optionOn: { backgroundColor: C.forest, borderColor: C.forest },
  optionText: { fontSize: 14, color: C.muted, fontWeight: '700' },
  optionTextOn: { color: C.white },
  error: { color: C.danger, fontSize: 14, marginBottom: 8, fontWeight: '600' },
  foot: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, padding: 16, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
});

const t = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderColor: C.border, flexWrap: 'wrap' },
  tableTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  count: { color: C.muted, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingHorizontal: 10, height: 36, minWidth: 160 },
  searchInput: { fontSize: 14, color: C.text, width: 110, flex: 1 },
  table: { minWidth: 720, width: '100%' },
  headRow: { flexDirection: 'row', backgroundColor: '#FBFBF8', borderBottomWidth: 1, borderColor: C.border },
  headCell: { paddingVertical: 12, paddingHorizontal: 14 },
  headText: { fontSize: 12, fontWeight: '800', color: C.muted, letterSpacing: 0.7, textTransform: 'uppercase' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F0F2ED' },
  rowAlt: { backgroundColor: '#FCFDFB' },
  cell: { paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'center' },
  cellText: { fontSize: 14, color: C.text },
});

const p = StyleSheet.create({
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginRight: 8 },
  pillOn: { backgroundColor: C.forest, borderColor: C.forest },
  pillText: { fontSize: 14, fontWeight: '700', color: C.muted },
  pillTextOn: { color: C.white },
});

const chips = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  chip: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: 18, minWidth: 120, ...SHADOW.card },
  value: { fontSize: 20, fontWeight: '800', color: C.forest },
  label: { fontSize: 13, color: C.muted, marginTop: 2 },
});
