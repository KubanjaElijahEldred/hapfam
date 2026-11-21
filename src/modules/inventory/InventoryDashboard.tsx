import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Warehouse, Boxes, PackageCheck, AlertTriangle, Truck, ArrowLeftRight, Gauge,
  Plus, ArrowUpRight, ChevronRight, ClipboardList, TrendingUp, ShieldCheck, CalendarClock,
} from 'lucide-react-native';
import { C, RADIUS } from '../../theme';
import { useApp } from '../../store';
import { IMG } from '../../assets';
import { HeroCarousel } from '../../components/HeroCarousel';
import { Bars, Ring, StackBar } from '../../components/charts';
import { Card, Kpi, SectionHead, Badge, Button, Row, Dot, gridWrap, gridItem, useGridCols, IconBox, InfoRow } from '../../components/ui';
import { FormModal } from '../../components/Records';

const slides = [
  { image: IMG.inventoryHero[0], eyebrow: 'Stores & Inventory', title: 'Smart Inventory.\nZero Wastage.', subtitle: 'Track. Manage. Optimize. — across every warehouse bay', accent: C.fresh },
  { image: IMG.inventoryHero[1], eyebrow: 'Warehouse Control', title: 'Every Bag Accounted For', subtitle: 'Raw materials, packaging and finished goods in one place', accent: C.fresh },
  { image: IMG.inventoryHero[2], eyebrow: 'Stock Integrity', title: 'Know What You Have,\nBefore You Need It', subtitle: 'Reorder alerts, batch and expiry tracking built in', accent: C.fresh },
];

export function InventoryDashboard() {
  const app = useApp();
  const router = useRouter();
  const cols = useGridCols();
  const { width } = useWindowDimensions();
  const [receive, setReceive] = useState(false);

  const rawQty = app.materials.filter(m => m.category === 'Raw Material').reduce((a, m) => a + m.qty, 0);
  const finishedQty = app.finished.reduce((a, f) => a + f.qty, 0);
  const low = app.materials.filter(m => m.qty < m.reorder);
  const pending = app.requests.filter(r => r.status === 'Pending');
  const capacity = Math.min(96, Math.round((rawQty + finishedQty) / 240));

  return (
    <View>
      <View style={[head, width < 720 && { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, minWidth: 0, width: width < 720 ? '100%' : undefined }}>
          <Text style={eyebrow}>DEPARTMENT 02 · STORES & INVENTORY</Text>
          <Text style={title}>Warehouse Overview</Text>
          <Text style={sub}>Control incoming stock, material issues and finished-goods inventory.</Text>
        </View>
        <View style={{ ...headRight, ...(width < 720 ? { width: '100%' as const } : {}) }}>
          <View style={datePill}><ShieldCheck size={14} color={C.primary} /><Text style={dateText}>Stock records synced</Text></View>
          <Button label="Receive delivery" icon={<Plus size={16} color={C.white} />} onPress={() => setReceive(true)} />
        </View>
      </View>

      <HeroCarousel slides={slides} />

      <View style={gridWrap(14)}>
        <View style={gridItem(cols)}><Kpi icon={<Gauge size={19} color={C.forest} />} label="Total Stock Value" value="UGX 486.2M" sub="Estimated on-hand value" tone="forest" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Boxes size={19} color={C.info} />} label="Total Stock Items" value={String(app.materials.length + app.products.length)} sub={`${app.materials.length} materials · ${app.products.length} products`} tone="info" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Warehouse size={19} color={C.primary} />} label="Raw Material Stock" value={`${rawQty.toLocaleString()} kg`} sub="Soya · Rice · Maize" tone="primary" /></View>
        <View style={gridItem(cols)}><Kpi icon={<PackageCheck size={19} color={C.fresh} />} label="Finished Products" value={`${finishedQty.toLocaleString()} bags`} sub="Saleable stock only" tone="fresh" /></View>
        <View style={gridItem(cols)}><Kpi icon={<AlertTriangle size={19} color={C.danger} />} label="Low Stock Alerts" value={String(low.length)} sub="Below reorder level" tone="danger" badge="Action" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Truck size={19} color={C.warning} />} label="Incoming Deliveries" value="3" sub="2 expected today" tone="warning" /></View>
        <View style={gridItem(cols)}><Kpi icon={<ArrowLeftRight size={19} color={C.info} />} label="Pending Material Requests" value={String(pending.length)} sub="From Production" tone="info" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Gauge size={19} color={C.fresh} />} label="Warehouse Capacity" value={`${capacity}%`} progress={capacity} sub="Space utilization" tone="fresh" /></View>
      </View>

      <View style={{ height: 26 }} />
      <SectionHead eyebrow="Raw materials & packaging" title="Materials Showcase" subtitle="Live stock levels across all stored items" action="Manage materials" onAction={() => router.push('/inventory/materials' as any)} />
      <View style={gridWrap(14)}>
        {app.materials.map(m => {
          const pct = Math.min(100, Math.round((m.qty / Math.max(m.reorder * 2.2, 1)) * 100));
          const tone = m.qty < m.reorder ? 'danger' : pct < 60 ? 'warning' : 'success';
          return (
            <View key={m.id} style={gridItem(cols)}>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={[matImg, { backgroundColor: tone === 'danger' ? C.dangerSoft : C.cream }]}>
                  <Image source={m.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  <View style={matBadge}><Badge label={m.category} tone={tone === 'danger' ? 'danger' : 'forest'} /></View>
                </View>
                <View style={{ padding: 15 }}>
                  <Text style={matName}>{m.name}</Text>
                  <Text style={matLoc}>{m.location}</Text>
                  <Row style={matStat}>
                    <Text style={matQty}>{m.qty.toLocaleString()} <Text style={matUnit}>{m.unit}</Text></Text>
                    <Text style={[matStatus, { color: tone === 'danger' ? C.danger : tone === 'warning' ? C.warning : C.primary }]}>
                      {tone === 'danger' ? 'Below reorder' : 'In stock'}
                    </Text>
                  </Row>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={matMeta}>Reorder level: {m.reorder.toLocaleString()} {m.unit}</Text>
                    <Text style={matMeta}>{pct}%</Text>
                  </Row>
                  <View style={matTrack}><View style={[matFill, { width: `${pct}%`, backgroundColor: tone === 'danger' ? C.danger : tone === 'warning' ? C.warning : C.primary }]} /></View>
                </View>
              </Card>
            </View>
          );
        })}
      </View>

      <View style={{ height: 26 }} />
      <View style={gridWrap(14)}>
        <View style={[gridItem(cols >= 3 ? 2 : 1)]}>
          <Card>
            <SectionHead eyebrow="Stock activity" title="Stock Movements" subtitle="Received, issued and finished goods this week" action="All movements" onAction={() => router.push('/inventory/movements' as any)} />
            <Bars data={[
              { label: 'Mon', value: 3200 }, { label: 'Tue', value: 2100 }, { label: 'Wed', value: 4100 },
              { label: 'Thu', value: 1800 }, { label: 'Fri', value: 3600 }, { label: 'Sat', value: 1400 }, { label: 'Sun', value: 900 },
            ]} tone="info" height={165} />
            <View style={stackWrap}>
              <Text style={stackLabel}>Movement mix</Text>
              <StackBar segments={[{ value: 48, tone: 'success' }, { value: 34, tone: 'info' }, { value: 18, tone: 'warning' }]} />
              <Row style={stackLegend}>
                <Row style={legendItem}><Dot tone="success" /><Text style={legendText}>Receipts</Text></Row>
                <Row style={legendItem}><Dot tone="info" /><Text style={legendText}>Issues</Text></Row>
                <Row style={legendItem}><Dot tone="warning" /><Text style={legendText}>Adjustments</Text></Row>
              </Row>
            </View>
          </Card>
        </View>
        <View style={[gridItem(cols >= 3 ? 1 : 1)]}>
          <Card style={{ alignItems: 'center', minHeight: 268 }}>
            <SectionHead eyebrow="Capacity" title="Warehouse Utilization" subtitle="Available storage space" />
            <Ring value={capacity} label="utilized" sub="3 warehouses" tone="fresh" size={150} />
            <View style={capList}>
              <InfoRow label="Warehouse A · Raw materials" value="82%" />
              <InfoRow label="Warehouse B · Bulk grain" value="91%" />
              <InfoRow label="Warehouse C · Packaging" value="64%" />
            </View>
          </Card>
        </View>
      </View>

      <View style={{ height: 26 }} />
      <Card>
        <SectionHead eyebrow="From production" title="Pending Material Requests" subtitle="Review availability, then issue approved quantities" action="Open requests" onAction={() => router.push('/inventory/requests' as any)} />
        {pending.length === 0 ? (
          <Text style={noPending}>No pending requests. All material requests have been processed.</Text>
        ) : pending.map(r => {
          const m = app.materials.find(x => x.id === r.materialId);
          return (
            <Row key={r.id} style={reqRow}>
              <View style={reqIcon}><ClipboardList size={17} color={C.warning} /></View>
              <View style={{ flex: 1 }}>
                <Text style={reqTitle}>{r.id} · {m?.name}</Text>
                <Text style={reqSub}>{r.orderId} · Requested {r.requested} {m?.unit} · {m?.qty.toLocaleString()} available</Text>
              </View>
              <Badge label="Pending" tone="warning" />
              <Pressable onPress={() => router.push('/inventory/requests' as any)} style={reqBtn}><Text style={reqBtnText}>Review</Text><ChevronRight size={14} color={C.primary} /></Pressable>
            </Row>
          );
        })}
        {low.length > 0 ? (
          <View style={alertBox}>
            <AlertTriangle size={17} color={C.danger} />
            <View style={{ flex: 1 }}>
              <Text style={alertTitle}>{low.length} item{low.length > 1 ? 's' : ''} below reorder level</Text>
              <Text style={alertText}>{low.map(x => x.name).join(', ')} — raise a purchase or delivery record.</Text>
            </View>
            <Pressable onPress={() => router.push('/inventory/materials' as any)} hitSlop={8}><ArrowUpRight size={17} color={C.danger} /></Pressable>
          </View>
        ) : null}
      </Card>

      <FormModal visible={receive} title="Record Goods Receipt" subtitle="Receipts update stock and raise a raw-material inspection request for Quality."
        submitLabel="Record receipt" onClose={() => setReceive(false)}
        fields={[
          { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-MAI', options: app.materials.map(m => ({ label: `${m.name} (${m.unit})`, value: m.id })) },
          { key: 'qty', label: 'Quantity received', type: 'number', required: true, placeholder: 'e.g. 2000' },
          { key: 'supplier', label: 'Supplier', required: true, placeholder: 'Supplier name' },
          { key: 'receivedBy', label: 'Received by', required: true, initial: 'Alice Wambui' },
          { key: 'date', label: 'Delivery date', type: 'date', placeholder: 'YYYY-MM-DD' },
        ]}
        onSubmit={v => app.receiveDelivery(v)} />
    </View>
  );
}

const head = { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 22, gap: 16, flexWrap: 'wrap' } as const;
const eyebrow = { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: C.info } as const;
const title = { fontSize: 29, fontWeight: '800', color: C.text, letterSpacing: -0.8, marginTop: 6 } as const;
const sub = { fontSize: 15, color: C.muted, marginTop: 6 } as const;
const headRight = { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' } as const;
const datePill = { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.pill, paddingHorizontal: 14, height: 42 } as const;
const dateText = { fontSize: 14, color: C.muted, fontWeight: '600' } as const;
const matImg = { height: 132, overflow: 'hidden' } as const;
const matBadge = { position: 'absolute', top: 10, left: 10 } as const;
const matName = { fontSize: 16, fontWeight: '800', color: C.text } as const;
const matLoc = { fontSize: 12, color: C.muted, marginTop: 3 } as const;
const matStat = { justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, marginBottom: 10 } as const;
const matQty = { fontSize: 22, fontWeight: '800', color: C.forest } as const;
const matUnit = { fontSize: 13, color: C.muted } as const;
const matStatus = { fontSize: 12, fontWeight: '800' } as const;
const matMeta = { fontSize: 12, color: C.muted } as const;
const matTrack = { height: 7, borderRadius: 4, backgroundColor: '#EEF1EB', overflow: 'hidden' } as const;
const matFill = { height: '100%' } as const;
const stackWrap = { marginTop: 16 } as const;
const stackLabel = { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 } as const;
const stackLegend = { gap: 16, marginTop: 9 } as const;
const legendItem = { gap: 6 } as const;
const legendText = { fontSize: 12, color: C.muted } as const;
const capList = { width: '100%', marginTop: 12, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 } as const;
const noPending = { fontSize: 14, color: C.muted, padding: 20, textAlign: 'center' } as const;
const reqRow = { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F2ED', gap: 11 } as const;
const reqIcon = { width: 36, height: 36, borderRadius: 10, backgroundColor: C.warningSoft, alignItems: 'center', justifyContent: 'center' } as const;
const reqTitle = { fontSize: 14, fontWeight: '800', color: C.text } as const;
const reqSub = { fontSize: 12, color: C.muted, marginTop: 3 } as const;
const reqBtn = { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8 } as const;
const reqBtnText = { color: C.primary, fontSize: 13, fontWeight: '800' } as const;
const alertBox = { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: C.dangerSoft, borderRadius: RADIUS.md, padding: 13, marginTop: 16 } as const;
const alertTitle = { fontSize: 14, fontWeight: '800', color: C.danger } as const;
const alertText = { fontSize: 12, color: '#9A5B57', marginTop: 2 } as const;
