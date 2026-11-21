import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Factory, ClipboardList, Layers3, Gauge, Cog, CircleCheck, PackageOpen, Plus,
  ArrowUpRight, Clock3, ChevronRight, Sprout, TrendingUp, Beaker, AlertTriangle,
} from 'lucide-react-native';
import { C, RADIUS } from '../../theme';
import { useApp } from '../../store';
import { IMG } from '../../assets';
import { HeroCarousel } from '../../components/HeroCarousel';
import { Bars, Ring } from '../../components/charts';
import { Card, Kpi, SectionHead, Badge, Button, Row, Dot, gridWrap, gridItem, useGridCols, IconBox } from '../../components/ui';
import { FormModal } from '../../components/Records';

const slides = [
  { image: IMG.productionHero[0], eyebrow: 'HAPFAM Manufacturing', title: 'Building Nutrition,\nOne Batch at a Time', subtitle: 'Soya • Rice • Maize Porridge Flour', accent: C.fresh },
  { image: IMG.productionHero[1], eyebrow: 'Production Control', title: 'Quality Production\nStarts Here', subtitle: 'Monitor every stage of the manufacturing line', accent: C.fresh },
  { image: IMG.productionHero[2], eyebrow: 'From Field to Flour', title: 'Turning Raw Materials\nInto Nutrition', subtitle: 'Efficient. Traceable. Reliable.', accent: C.fresh },
];

export function ProductionDashboard() {
  const app = useApp();
  const router = useRouter();
  const cols = useGridCols();
  const { width } = useWindowDimensions();
  const [newOrder, setNewOrder] = useState(false);

  const active = app.orders.filter(o => o.status === 'In Progress').length;
  const pending = app.orders.filter(o => o.status === 'Planned').length;
  const inspection = app.batches.filter(b => b.status === 'In Inspection').length;
  const completed = app.orders.filter(o => o.status === 'Completed').length;
  const achievement = Math.round((completed / Math.max(app.orders.length, 1)) * 100);
  const lowStock = app.materials.filter(m => m.qty < m.reorder).length;

  return (
    <View>
      <View style={[head, width < 720 && { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, minWidth: 0, width: width < 720 ? '100%' : undefined }}>
          <Text style={eyebrow}>DEPARTMENT 01 · PRODUCTION MANAGEMENT</Text>
          <Text style={title}>Production Overview</Text>
          <Text style={sub}>Plan, manufacture and trace every batch of HAPFAM porridge flour.</Text>
        </View>
        <View style={{ ...headRight, ...(width < 720 ? { width: '100%' as const } : {}) }}>
          <View style={datePill}><Clock3 size={14} color={C.muted} /><Text style={dateText}>{new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
          <Button label="New production order" icon={<Plus size={16} color={C.white} />} onPress={() => setNewOrder(true)} />
        </View>
      </View>

      <HeroCarousel slides={slides} />

      <View style={gridWrap(14)}>
        <View style={gridItem(cols)}><Kpi icon={<Factory size={19} color={C.primary} />} label="Today's Production" value="4,420 kg" sub="Across 3 product lines" tone="primary" badge="+12.4%" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Layers3 size={19} color={C.info} />} label="Active Batches" value={String(app.batches.filter(b => b.status === 'Draft' || b.status === 'In Inspection').length)} sub={`${inspection} awaiting inspection`} tone="info" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Gauge size={19} color={C.fresh} />} label="Target Achievement" value={`${achievement}%`} progress={achievement} sub="This month" tone="fresh" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Cog size={19} color={C.forest} />} label="Machines Running" value="7 / 9" sub="Milling & packaging lines" tone="forest" badge="Online" /></View>
        <View style={gridItem(cols)}><Kpi icon={<CircleCheck size={19} color={C.primary} />} label="Completion Rate" value="92%" progress={92} sub="Planned vs actual" tone="success" /></View>
        <View style={gridItem(cols)}><Kpi icon={<ClipboardList size={19} color={C.warning} />} label="Pending Orders" value={String(pending)} sub={`${active} in progress`} tone="warning" /></View>
      </View>

      <View style={{ height: 10 }} />
      <View style={gridWrap(14)}>
        <View style={[gridItem(cols >= 3 ? 2 : 1)]}>
          <Card>
            <SectionHead eyebrow="Output trends" title="Weekly Production" subtitle="Kilograms manufactured per day" action="Full report" onAction={() => router.push('/production/reports' as any)} />
            <Bars data={[
              { label: 'Mon', value: 4200 }, { label: 'Tue', value: 4800 }, { label: 'Wed', value: 3900 },
              { label: 'Thu', value: 5400 }, { label: 'Fri', value: 5100 }, { label: 'Sat', value: 3200 }, { label: 'Sun', value: 2100 },
            ]} tone="success" height={170} goal={4500} />
            <View style={legend}>
              <Row style={legendItem}><Dot tone="success" /><Text style={legendText}>Actual output</Text></Row>
              <View style={legendDash} /><Text style={legendText}>Daily target 4,500 kg</Text>
            </View>
          </Card>
        </View>
        <View style={[gridItem(cols >= 3 ? 1 : 1)]}>
          <Card style={{ alignItems: 'center', justifyContent: 'center', minHeight: 268 }}>
            <Text style={sideTitle}>Production Target</Text>
            <Text style={sideSub}>Monthly plan vs achieved</Text>
            <Ring value={achievement} label="of 120 t target" tone="success" size={162} />
            <View style={ringFoot}>
              <Row style={legendItem}><Dot tone="success" /><Text style={legendText}>Completed</Text></Row>
              <Text style={ringVal}>{completed} orders</Text>
            </View>
          </Card>
        </View>
      </View>

      <View style={{ height: 26 }} />
      <SectionHead eyebrow="Our products" title="Product Showcase" subtitle="Three nutritious porridge flour lines manufactured at HAPFAM" action="View orders" onAction={() => router.push('/production/orders' as any)} />
      <View style={gridWrap(16)}>
        {app.products.map(p => {
          const made = app.batches.filter(b => b.productId === p.id).reduce((a, b) => a + b.produced, 0);
          return (
            <View key={p.id} style={gridItem(cols)}>
              <Pressable onPress={() => router.push('/production/batches' as any)} style={({ pressed }) => [productCard, pressed && { opacity: 0.8 }]}>
                <View style={[productImg, { backgroundColor: `${p.color}14` }]}>
                  <Image source={p.image} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                  <View style={productBadge}><Badge label={p.flavor} tone="forest" /></View>
                </View>
                <View style={productBody}>
                  <Text style={pName}>{p.name}</Text>
                  <Text style={pDesc} numberOfLines={2}>{p.description}</Text>
                  <View style={pMeta}>
                    <View><Text style={pMetaVal}>{made.toLocaleString()} kg</Text><Text style={pMetaLab}>Produced to date</Text></View>
                    <Pressable onPress={() => router.push('/production/batches' as any)} style={pLink}><Text style={pLinkText}>View details</Text><ArrowUpRight size={14} color={C.primary} /></Pressable>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={{ height: 26 }} />
      <View style={gridWrap(14)}>
        <View style={gridItem(cols >= 3 ? 2 : 1)}>
          <Card>
            <SectionHead eyebrow="Live feed" title="Recent Activities" subtitle="Latest operations across the production floor" />
            {app.activities.slice(0, 5).map((a, i) => (
              <Row key={a.id} style={activityRow}>
                <IconBox tone={a.tone} size={36}>{a.tone === 'success' ? <CircleCheck size={17} color={C.primary} /> : a.tone === 'warning' ? <AlertTriangle size={17} color={C.warning} /> : <Factory size={17} color={C.info} />}</IconBox>
                <View style={{ flex: 1, marginLeft: 11 }}>
                  <Text style={actTitle}>{a.text}</Text>
                  <Text style={actDetail} numberOfLines={1}>{a.detail}</Text>
                </View>
                <Text style={actTime}>{a.time}</Text>
              </Row>
            ))}
          </Card>
        </View>
        <View style={gridItem(cols >= 3 ? 1 : 1)}>
          <Card>
            <SectionHead eyebrow="Cross-department" title="Workflow Queue" subtitle="Items needing your attention" />
            <WorkflowRow icon={<PackageOpen size={17} color={C.warning} />} title="Material requests" value={`${app.requests.filter(r => r.status === 'Pending').length} awaiting issue`} onPress={() => router.push('/production/consumption' as any)} />
            <WorkflowRow icon={<Beaker size={17} color={C.info} />} title="Batches in inspection" value={`${inspection} with Quality`} onPress={() => router.push('/production/batches' as any)} />
            <WorkflowRow icon={<TrendingUp size={17} color={C.primary} />} title="Low stock alerts" value={`${lowStock} material(s)`} onPress={() => router.push('/inventory/materials' as any)} />
            <WorkflowRow icon={<Sprout size={17} color={C.fresh} />} title="Production plan" value={`${pending} orders planned`} onPress={() => router.push('/production/planning' as any)} />
          </Card>
        </View>
      </View>

      <FormModal visible={newOrder} title="Create Production Order" subtitle="Orders are shared with Inventory and Quality automatically."
        submitLabel="Create order" onClose={() => setNewOrder(false)}
        fields={[
          { key: 'productId', label: 'Product flavour', type: 'select', required: true, initial: 'PRD-SOY', options: app.products.map(p => ({ label: p.name, value: p.id })) },
          { key: 'qty', label: 'Planned quantity', type: 'number', required: true, placeholder: 'e.g. 2000' },
          { key: 'unit', label: 'Unit', type: 'select', initial: 'kg', options: [{ label: 'Kilograms (kg)', value: 'kg' }, { label: 'Bags', value: 'bags' }] },
          { key: 'start', label: 'Planned start date', type: 'date', required: true, placeholder: 'YYYY-MM-DD' },
          { key: 'due', label: 'Expected completion', type: 'date', required: true, placeholder: 'YYYY-MM-DD' },
          { key: 'supervisor', label: 'Production supervisor', required: true, placeholder: 'Full name' },
          { key: 'priority', label: 'Priority', type: 'select', initial: 'Normal', options: [{ label: 'High', value: 'High' }, { label: 'Normal', value: 'Normal' }, { label: 'Low', value: 'Low' }] },
          { key: 'instructions', label: 'Production instructions', type: 'textarea', placeholder: 'Mandatory notes for the production floor' },
        ]}
        onSubmit={v => { app.createOrder(v); }} />
    </View>
  );
}

function WorkflowRow({ icon, title, value, onPress }: { icon: React.ReactNode; title: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={wf.row}>
      <View style={wf.icon}>{icon}</View>
      <View style={{ flex: 1 }}><Text style={wf.title}>{title}</Text><Text style={wf.value}>{value}</Text></View>
      <ChevronRight size={16} color={C.muted} />
    </Pressable>
  );
}

const head = { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 22, gap: 16, flexWrap: 'wrap' } as const;
const eyebrow = { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: C.primary } as const;
const title = { fontSize: 29, fontWeight: '800', color: C.text, letterSpacing: -0.8, marginTop: 6 } as const;
const sub = { fontSize: 15, color: C.muted, marginTop: 6 } as const;
const headRight = { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' } as const;
const datePill = { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.pill, paddingHorizontal: 14, height: 42 } as const;
const dateText = { fontSize: 14, color: C.muted, fontWeight: '600' } as const;
const legend = { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14 } as const;
const legendItem = { gap: 6 } as const;
const legendText = { fontSize: 13, color: C.muted } as const;
const legendDash = { width: 18, height: 2, backgroundColor: C.warning } as const;
const sideTitle = { fontSize: 17, fontWeight: '800', color: C.text } as const;
const sideSub = { fontSize: 13, color: C.muted, marginTop: 3, marginBottom: 8 } as const;
const ringFoot = { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 } as const;
const ringVal = { fontSize: 13, fontWeight: '700', color: C.forest } as const;
const productCard = { backgroundColor: C.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, overflow: 'hidden' } as const;
const productImg = { height: 190, alignItems: 'center', justifyContent: 'center' } as const;
const productBadge = { position: 'absolute', left: 12, top: 12 } as const;
const productBody = { padding: 16 } as const;
const pName = { fontSize: 17, fontWeight: '800', color: C.text } as const;
const pDesc = { fontSize: 13, color: C.muted, lineHeight: 19, marginTop: 6, minHeight: 34 } as const;
const pMeta = { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 } as const;
const pMetaVal = { fontSize: 17, fontWeight: '800', color: C.forest } as const;
const pMetaLab = { fontSize: 12, color: C.muted, marginTop: 2 } as const;
const pLink = { flexDirection: 'row', alignItems: 'center', gap: 4 } as const;
const pLinkText = { fontSize: 13, fontWeight: '800', color: C.primary } as const;
const activityRow = { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' } as const;
const actTitle = { fontSize: 14, fontWeight: '700', color: C.text } as const;
const actDetail = { fontSize: 13, color: C.muted, marginTop: 2 } as const;
const actTime = { fontSize: 12, color: C.muted } as const;
const wf = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: C.text },
  value: { fontSize: 12, color: C.muted, marginTop: 2 },
});
