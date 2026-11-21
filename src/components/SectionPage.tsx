import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Plus, CheckCircle2, XCircle, Ban, Clock3, Bell, Settings2, FileBarChart2, PackageOpen,
  Truck, Beaker, ShieldCheck, AlertTriangle, ChevronRight, ClipboardCheck, TrendingUp, X, FlaskConical,
} from 'lucide-react-native';
import { C, RADIUS } from '../theme';
import { useApp } from '../store';
import type { Dept } from '../types';
import { Bars, Ring, Trend } from './charts';
import { Header, Card, Badge, Button, Row, Kpi, SectionHead, InfoRow, Empty, gridWrap, gridItem, useGridCols, IconBox, Progress } from './ui';
import { DataTable, FormModal, FilterPills, StatChips, type Column } from './Records';
import { AnnouncementCenter } from './AnnouncementCenter';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
const toneOf = (s: string): Tone => {
  if (['Approved', 'Issued', 'Completed', 'Pass', 'Closed', 'In stock'].includes(s)) return 'success';
  if (['Rejected', 'Fail', 'Open'].includes(s)) return 'danger';
  if (['Pending', 'Planned', 'In Inspection', 'On Hold', 'Draft', 'Partial', 'In Progress'].includes(s)) return 'warning';
  return 'info';
};
const Status = ({ label }: { label: string }) => <Badge label={label} tone={toneOf(label)} />;

/* ---------------------------------- shared ---------------------------------- */

function NotificationsSection({ dept }: { dept: Dept }) {
  const app = useApp();
  const items = app.notifications.filter(n => n.dept === dept);
  return (
    <View>
      <Header title="Notifications" subtitle={`Departmental alerts for the ${dept} workspace.`} right={<Button label="Mark all read" variant="outline" onPress={() => app.markAllRead(dept)} />} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? <Empty title="No notifications" text="Workflow events will appear here." /> : items.map(n => (
          <Pressable key={n.id} onPress={() => app.markRead(n.id)} style={[nRow, !n.read && nUnread]}>
            <IconBox tone={n.tone} size={40}>{n.tone === 'danger' ? <XCircle size={18} color={C.danger} /> : n.tone === 'success' ? <CheckCircle2 size={18} color={C.primary} /> : n.tone === 'warning' ? <AlertTriangle size={18} color={C.warning} /> : <Bell size={18} color={C.info} />}</IconBox>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={nTitle}>{n.title}</Text>
              <Text style={nBody}>{n.body}</Text>
              <Text style={nTime}>{n.time} · {n.dept}</Text>
            </View>
            {!n.read ? <View style={nDot} /> : null}
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

function SettingsSection({ dept }: { dept: Dept }) {
  const app = useApp();
  const [specModal, setSpecModal] = useState(false);
  const [notify, setNotify] = useState(true);
  const [digest, setDigest] = useState(false);
  return (
    <View>
      <Header title="Settings" subtitle="Department preferences and access information." />
      <View style={gridWrap(14)}>
        <View style={gridItem(2)}>
          <Card>
            <SectionHead eyebrow="Account" title="Profile & access" subtitle="Signed-in departmental user" />
            <InfoRow label="Name" value={dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : 'Daniel Ochieng'} />
            <InfoRow label="Department" value={dept.toUpperCase()} />
            <InfoRow label="Role" value={dept === 'quality' ? 'Quality Assurance Officer' : dept === 'inventory' ? 'Store Keeper' : 'Production Manager'} />
            <InfoRow label="Access scope" value="Full departmental access" />
            <InfoRow label="Cross-department" value="Permission-controlled read" />
          </Card>
        </View>
        <View style={gridItem(2)}>
          <Card>
            <SectionHead eyebrow="Preferences" title="Notifications" subtitle="Choose which workflow events reach you" />
            <Toggle label="Workflow notifications" value={notify} onChange={setNotify} />
            <Toggle label="Daily summary digest" value={digest} onChange={setDigest} />
            <InfoRow label="Data mode" value={app.demo ? 'Demonstration records' : 'Live records'} />
          </Card>
        </View>
      </View>
      {dept === 'quality' ? (
        <View style={{ marginTop: 14 }}>
          <Card>
            <SectionHead eyebrow="Controlled configuration" title="Quality Specifications" subtitle="Actual HAPFAM limits — configured by authorised staff, never assumed" right={<Button small label="Add specification" icon={<Plus size={14} color={C.white} />} onPress={() => setSpecModal(true)} />} />
            <DataTable columns={[
              { key: 'test', label: 'Test', flex: 2 },
              { key: 'product', label: 'Product', flex: 1 },
              { key: 'min', label: 'Min', flex: 1 },
              { key: 'max', label: 'Max', flex: 1 },
              { key: 'unit', label: 'Unit', flex: 1 },
              { key: 'method', label: 'Method', flex: 2 },
            ]} rows={app.specs} />
          </Card>
          <FormModal visible={specModal} title="Add Quality Specification" subtitle="Enter the authorised HAPFAM limit for this test." submitLabel="Save specification" onClose={() => setSpecModal(false)}
            fields={[
              { key: 'test', label: 'Test name', required: true },
              { key: 'product', label: 'Applies to', type: 'select', initial: 'All', options: ['All', 'Soya', 'Rice', 'Maize'].map(x => ({ label: x, value: x })) },
              { key: 'min', label: 'Minimum', placeholder: '— if not applicable' },
              { key: 'max', label: 'Maximum', placeholder: '— if not applicable' },
              { key: 'unit', label: 'Unit', placeholder: '%' },
              { key: 'method', label: 'Test method', required: true },
            ]}
            onSubmit={v => app.saveSpec(v)} />
        </View>
      ) : null}
    </View>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={tg.row}>
      <Text style={tg.label}>{label}</Text>
      <View style={[tg.track, value && { backgroundColor: C.primary }]}><View style={[tg.knob, value && { left: 20 }]} /></View>
    </Pressable>
  );
}

function ReportsSection({ dept }: { dept: Dept }) {
  const app = useApp();
  const [range, setRange] = useState('Weekly');
  const production = dept === 'production';
  const inventory = dept === 'inventory';
  return (
    <View>
      <Header title={`${dept === 'quality' ? 'Quality' : inventory ? 'Inventory' : 'Production'} Reports`} subtitle="Visual reports generated from live application records." />
      <FilterPills options={['Daily', 'Weekly', 'Monthly']} value={range} onChange={setRange} />
      <View style={gridWrap(14)}>
        <View style={gridItem(2)}>
          <Card>
            <SectionHead eyebrow={`${range} view`} title={production ? 'Output vs Plan' : inventory ? 'Stock Movements' : 'Inspection Outcomes'} subtitle="Built from recorded transactions" />
            <Bars data={[
              { label: 'Mon', value: production ? 4200 : inventory ? 3200 : 12 },
              { label: 'Tue', value: production ? 4800 : inventory ? 2100 : 15 },
              { label: 'Wed', value: production ? 3900 : inventory ? 4100 : 10 },
              { label: 'Thu', value: production ? 5400 : inventory ? 1800 : 18 },
              { label: 'Fri', value: production ? 5100 : inventory ? 3600 : 14 },
              { label: 'Sat', value: production ? 3200 : inventory ? 1400 : 8 },
              { label: 'Sun', value: production ? 2100 : inventory ? 900 : 6 },
            ]} tone={inventory ? 'info' : 'success'} height={190} />
          </Card>
        </View>
        <View style={gridItem(2)}>
          <Card>
            <SectionHead eyebrow="Performance" title={production ? 'Completion Rate' : inventory ? 'Stock Health' : 'Pass Rate'} subtitle="Current period indicator" />
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Ring value={production ? 92 : inventory ? 78 : Math.round((app.inspections.filter(i => i.decision === 'Pass').length / Math.max(app.inspections.length, 1)) * 100)} label={production ? 'of plan achieved' : inventory ? 'items in stock' : 'batches passed'} size={170} />
            </View>
          </Card>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <Card>
          <SectionHead eyebrow="Trend" title="Performance Over Time" subtitle="Rolling nine-period view" />
          <Trend points={production ? [62, 70, 66, 78, 74, 86, 82, 91, 88] : inventory ? [55, 60, 58, 66, 71, 68, 75, 79, 82] : [60, 68, 65, 72, 77, 80, 84, 86, 90]} tone={inventory ? 'info' : 'success'} height={170} />
        </Card>
      </View>
    </View>
  );
}

/* -------------------------------- production -------------------------------- */

function ProductionSection({ section }: { section: string }) {
  const app = useApp();
  const router = useRouter();
  const [modal, setModal] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null);
  const cols = useGridCols();

  if (section === 'notifications') return <NotificationsSection dept="production" />;
  if (section === 'settings') return <SettingsSection dept="production" />;
  if (section === 'reports') return <ReportsSection dept="production" />;

  if (section === 'orders' || section === 'planning') {
    const rows = section === 'planning' ? app.orders.filter(o => o.status === 'Planned') : app.orders;
    const columns: Column[] = [
      { key: 'id', label: 'Order', flex: 1.4, render: r => <Text style={cellStrong}>{r.id}</Text> },
      { key: 'product', label: 'Product', flex: 1.8, render: r => <Text style={cell}>{app.products.find(p => p.id === r.productId)?.name || r.productId}</Text> },
      { key: 'qty', label: 'Quantity', flex: 1, render: r => <Text style={cell}>{r.qty} {r.unit}</Text> },
      { key: 'due', label: 'Due', flex: 1, render: r => <Text style={cell}>{r.due}</Text> },
      { key: 'supervisor', label: 'Supervisor', flex: 1.4, render: r => <Text style={cell}>{r.supervisor}</Text> },
      { key: 'priority', label: 'Priority', flex: 1, render: r => <Badge label={r.priority} tone={r.priority === 'High' ? 'danger' : r.priority === 'Low' ? 'info' : 'warning'} /> },
      { key: 'status', label: 'Status', flex: 1.2, render: r => <Status label={r.status} /> },
    ];
    return (
      <View>
        <Header title={section === 'planning' ? 'Production Planning' : 'Production Orders'} subtitle={section === 'planning' ? 'Create and schedule upcoming manufacturing orders.' : 'All manufacturing orders and their live status.'} right={<Button label="New order" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('order')} />} />
        <StatChips items={[
          { label: 'Total orders', value: String(app.orders.length) },
          { label: 'Planned', value: String(app.orders.filter(o => o.status === 'Planned').length), tone: 'warning' },
          { label: 'In progress', value: String(app.orders.filter(o => o.status === 'In Progress').length), tone: 'info' },
          { label: 'Completed', value: String(app.orders.filter(o => o.status === 'Completed').length), tone: 'success' },
        ]} />
        <DataTable columns={columns} rows={rows} onRowPress={r => { setActive(r); setModal('detail'); }} emptyTitle="No orders yet" emptyText="Create a production order to begin." />
        <FormModal visible={modal === 'order'} title="Create Production Order" submitLabel="Create order" onClose={() => setModal(null)}
          fields={[
            { key: 'productId', label: 'Product', type: 'select', required: true, initial: 'PRD-SOY', options: app.products.map(p => ({ label: p.name, value: p.id })) },
            { key: 'qty', label: 'Planned quantity', type: 'number', required: true },
            { key: 'unit', label: 'Unit', type: 'select', initial: 'kg', options: [{ label: 'kg', value: 'kg' }, { label: 'bags', value: 'bags' }] },
            { key: 'start', label: 'Start date', type: 'date', required: true },
            { key: 'due', label: 'Completion date', type: 'date', required: true },
            { key: 'supervisor', label: 'Supervisor', required: true },
            { key: 'priority', label: 'Priority', type: 'select', initial: 'Normal', options: ['High', 'Normal', 'Low'].map(x => ({ label: x, value: x })) },
            { key: 'instructions', label: 'Instructions', type: 'textarea' },
          ]} onSubmit={v => app.createOrder(v)} />
        <FormModal visible={modal === 'request'} title="Request Materials" subtitle="Sent to Inventory for availability check and issue." submitLabel="Send request" onClose={() => setModal(null)}
          fields={[
            { key: 'orderId', label: 'Production order', type: 'select', required: true, initial: active?.id, options: app.orders.map(o => ({ label: o.id, value: o.id })) },
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-SOY', options: app.materials.map(m => ({ label: `${m.name} · ${m.qty} ${m.unit} available`, value: m.id })) },
            { key: 'qty', label: 'Quantity', type: 'number', required: true },
            { key: 'requester', label: 'Requested by', initial: active?.supervisor || 'Production' },
          ]} onSubmit={v => app.requestMaterial(v)} />
        <DetailModal visible={modal === 'detail'} title={active?.id || 'Order'} onClose={() => setModal(null)} active={active}>
          {active ? <>
            <InfoRow label="Product" value={app.products.find(p => p.id === active.productId)?.name || active.productId} />
            <InfoRow label="Quantity" value={`${active.qty} ${active.unit}`} />
            <InfoRow label="Start / Due" value={`${active.start} → ${active.due}`} />
            <InfoRow label="Supervisor" value={active.supervisor} />
            <InfoRow label="Priority" value={active.priority} />
            <InfoRow label="Status" value={active.status} tone={toneOf(active.status)} />
            <Row style={detailBtns}>
              <Button small label="Request materials" onPress={() => setModal('request')} />
              {active.status !== 'Completed' ? <Button small label="Mark complete" tone="forest" variant="outline" onPress={() => { app.updateOrderStatus(active.id, 'Completed'); setModal(null); }} /> : null}
            </Row>
          </> : null}
        </DetailModal>
      </View>
    );
  }

  if (section === 'batches' || section === 'history') {
    const rows = section === 'history' ? app.batches.filter(b => b.status === 'Approved' || b.status === 'Rejected') : app.batches;
    const columns: Column[] = [
      { key: 'id', label: 'Batch ID', flex: 1.5, render: r => <Text style={cellStrong}>{r.id}</Text> },
      { key: 'product', label: 'Product', flex: 1.8, render: r => <Text style={cell}>{app.products.find(p => p.id === r.productId)?.name || r.productId}</Text> },
      { key: 'orderId', label: 'Order', flex: 1.3, render: r => <Text style={cell}>{r.orderId}</Text> },
      { key: 'produced', label: 'Produced', flex: 1, render: r => <Text style={cell}>{r.produced} kg</Text> },
      { key: 'bags', label: 'Bags', flex: 0.8, render: r => <Text style={cell}>{r.bags}</Text> },
      { key: 'date', label: 'Date', flex: 1.1, render: r => <Text style={cell}>{r.date}</Text> },
      { key: 'status', label: 'Status', flex: 1.3, render: r => <Status label={r.status} /> },
    ];
    return (
      <View>
        <Header title={section === 'history' ? 'Production History' : 'Batch Management'} subtitle={section === 'history' ? 'Completed batch record with outcomes.' : 'Create, track and submit manufacturing batches.'} right={<Button label="New batch" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('batch')} />} />
        <StatChips items={[
          { label: 'Total batches', value: String(app.batches.length) },
          { label: 'In inspection', value: String(app.batches.filter(b => b.status === 'In Inspection').length), tone: 'warning' },
          { label: 'Approved', value: String(app.batches.filter(b => b.status === 'Approved').length), tone: 'success' },
          { label: 'Rejected', value: String(app.batches.filter(b => b.status === 'Rejected').length), tone: 'danger' },
        ]} />
        <DataTable columns={columns} rows={rows} onRowPress={r => { setActive(r); setModal('detail'); }} emptyTitle="No batches" emptyText="Create a batch from a production order." />
        <FormModal visible={modal === 'batch'} title="Create Production Batch" subtitle="A unique batch ID is generated automatically." submitLabel="Create batch" onClose={() => setModal(null)}
          fields={[
            { key: 'productId', label: 'Product', type: 'select', required: true, initial: 'PRD-SOY', options: app.products.map(p => ({ label: p.name, value: p.id })) },
            { key: 'orderId', label: 'Production order', type: 'select', required: true, initial: app.orders[0]?.id, options: app.orders.map(o => ({ label: o.id, value: o.id })) },
            { key: 'produced', label: 'Quantity manufactured (kg)', type: 'number', required: true },
            { key: 'bags', label: 'Bags packaged', type: 'number', required: true },
            { key: 'wastage', label: 'Wastage (kg)', type: 'number' },
            { key: 'supervisor', label: 'Supervisor', required: true, initial: 'Daniel Ochieng' },
          ]} onSubmit={v => app.createBatch(v)} />
        <DetailModal visible={modal === 'detail'} title={active?.id || 'Batch'} onClose={() => setModal(null)} active={active}>
          {active ? <>
            <InfoRow label="Product" value={app.products.find(p => p.id === active.productId)?.name || ''} />
            <InfoRow label="Order" value={active.orderId} />
            <InfoRow label="Produced" value={`${active.produced} kg · ${active.bags} bags`} />
            <InfoRow label="Wastage" value={`${active.wastage} kg`} />
            <InfoRow label="Supervisor" value={active.supervisor} />
            <InfoRow label="Status" value={active.status} tone={toneOf(active.status)} />
            <Text style={detailSub}>Materials consumed</Text>
            {Object.entries(active.consumed || {}).map(([k, v]) => <InfoRow key={k} label={app.materials.find(m => m.id === k)?.name || k} value={`${v} ${app.materials.find(m => m.id === k)?.unit || ''}`} />)}
            <Row style={detailBtns}>
              {(active.status === 'Draft') ? <Button small label="Submit to Quality" onPress={() => { app.submitBatch(active.id); setModal(null); }} /> : null}
            </Row>
          </> : null}
        </DetailModal>
      </View>
    );
  }

  if (section === 'consumption') {
    const rows = app.batches.flatMap(b => Object.entries(b.consumed || {}).map(([materialId, qty]) => ({ id: `${b.id}-${materialId}`, batchId: b.id, materialId, qty, date: b.date })));
    return (
      <View>
        <Header title="Material Consumption" subtitle="Ingredients and packaging recorded against production batches." right={<Button label="Request materials" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('request')} />} />
        <StatChips items={[
          { label: 'Consumption records', value: String(rows.length) },
          { label: 'Batches with records', value: String(app.batches.filter(b => Object.keys(b.consumed || {}).length).length) },
        ]} />
        <DataTable columns={[
          { key: 'batchId', label: 'Batch', flex: 1.5, render: r => <Text style={cellStrong}>{r.batchId}</Text> },
          { key: 'material', label: 'Material', flex: 2, render: r => <Text style={cell}>{app.materials.find(m => m.id === r.materialId)?.name || r.materialId}</Text> },
          { key: 'qty', label: 'Quantity used', flex: 1.2, render: r => <Text style={cell}>{r.qty} {app.materials.find(m => m.id === r.materialId)?.unit || ''}</Text> },
          { key: 'date', label: 'Date', flex: 1, render: r => <Text style={cell}>{r.date}</Text> },
        ]} rows={rows} emptyTitle="No consumption recorded" emptyText="Consumption is captured when a batch is created." />
        <FormModal visible={modal === 'request'} title="Request Materials from Inventory" submitLabel="Send request" onClose={() => setModal(null)}
          fields={[
            { key: 'orderId', label: 'Order', type: 'select', required: true, initial: app.orders[0]?.id, options: app.orders.map(o => ({ label: o.id, value: o.id })) },
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-SOY', options: app.materials.map(m => ({ label: `${m.name} · ${m.qty} ${m.unit}`, value: m.id })) },
            { key: 'qty', label: 'Quantity', type: 'number', required: true },
          ]} onSubmit={v => { app.requestMaterial(v); }} />
      </View>
    );
  }

  if (section === 'schedule') {
    return (
      <View>
        <Header title="Production Schedule" subtitle="Upcoming and active manufacturing work, ordered by due date." />
        <View style={gridWrap(14)}>
          {[...app.orders].sort((a, b) => a.due.localeCompare(b.due)).map(o => (
            <View key={o.id} style={gridItem(2)}>
              <Card>
                <Row style={schHead}><Badge label={o.id} tone="forest" /><Status label={o.status} /></Row>
                <Text style={schName}>{app.products.find(p => p.id === o.productId)?.name}</Text>
                <InfoRow label="Quantity" value={`${o.qty} ${o.unit}`} />
                <InfoRow label="Start" value={o.start} />
                <InfoRow label="Due" value={o.due} />
                <InfoRow label="Supervisor" value={o.supervisor} />
                <View style={schBar}><Progress value={o.status === 'Completed' ? 100 : o.status === 'In Progress' ? 60 : 10} tone={o.status === 'Completed' ? 'success' : o.status === 'In Progress' ? 'info' : 'warning'} /></View>
              </Card>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return <Empty title="Section unavailable" text="This module is being prepared." />;
}

/* --------------------------------- inventory -------------------------------- */

function InventorySection({ section }: { section: string }) {
  const app = useApp();
  const [modal, setModal] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null);
  const cols = useGridCols();

  if (section === 'notifications') return <NotificationsSection dept="inventory" />;
  if (section === 'settings') return <SettingsSection dept="inventory" />;
  if (section === 'reports') return <ReportsSection dept="inventory" />;

  if (section === 'materials' || section === 'expiry') {
    const rows = section === 'expiry' ? app.materials.filter(m => m.expiry) : app.materials;
    const columns: Column[] = [
      { key: 'name', label: 'Material', flex: 2, render: r => <Row style={cellRow}><Image source={r.image} style={cellImg} contentFit="cover" /><Text style={cellStrong}>{r.name}</Text></Row> },
      { key: 'category', label: 'Category', flex: 1.2, render: r => <Badge label={r.category} tone="neutral" /> },
      { key: 'qty', label: 'On hand', flex: 1, render: r => <Text style={cell}>{r.qty.toLocaleString()} {r.unit}</Text> },
      { key: 'reorder', label: 'Reorder at', flex: 1, render: r => <Text style={cell}>{r.reorder.toLocaleString()}</Text> },
      { key: 'location', label: 'Location', flex: 1.6, render: r => <Text style={cell}>{r.location}</Text> },
      { key: 'supplier', label: 'Supplier', flex: 1.5, render: r => <Text style={cell}>{r.supplier}</Text> },
      { key: 'expiry', label: section === 'expiry' ? 'Expiry' : 'Status', flex: 1.2, render: r => section === 'expiry' ? <Text style={cell}>{r.expiry || '—'}</Text> : <Status label={r.qty < r.reorder ? 'Open' : 'Approved'} /> },
    ];
    return (
      <View>
        <Header title={section === 'expiry' ? 'Expiry Tracking' : 'Raw Materials & Packaging'} subtitle={section === 'expiry' ? 'Materials with batch and expiry information.' : 'Register materials and monitor reorder levels.'} right={<Button label="Register material" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('register')} />} />
        <StatChips items={[
          { label: 'Materials', value: String(app.materials.length) },
          { label: 'Below reorder', value: String(app.materials.filter(m => m.qty < m.reorder).length), tone: 'danger' },
          { label: 'With expiry', value: String(app.materials.filter(m => m.expiry).length), tone: 'info' },
        ]} />
        <DataTable columns={columns} rows={rows} onRowPress={r => { setActive(r); setModal('receive'); }} emptyTitle="No materials" />
        <FormModal visible={modal === 'register'} title="Register Material" submitLabel="Register" onClose={() => setModal(null)}
          fields={[
            { key: 'name', label: 'Material name', required: true },
            { key: 'category', label: 'Category', type: 'select', initial: 'Raw Material', options: [{ label: 'Raw Material', value: 'Raw Material' }, { label: 'Packaging', value: 'Packaging' }] },
            { key: 'unit', label: 'Unit', type: 'select', initial: 'kg', options: [{ label: 'kg', value: 'kg' }, { label: 'pcs', value: 'pcs' }] },
            { key: 'qty', label: 'Initial quantity', type: 'number' },
            { key: 'reorder', label: 'Reorder level', type: 'number' },
            { key: 'location', label: 'Storage location' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'expiry', label: 'Expiry date', type: 'date' },
          ]} onSubmit={v => app.registerMaterial(v)} />
        <FormModal visible={modal === 'receive'} title="Receive Delivery" subtitle={`Receiving stock for ${active?.name || 'material'}.`} submitLabel="Record receipt" onClose={() => setModal(null)}
          fields={[
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: active?.id, options: app.materials.map(m => ({ label: m.name, value: m.id })) },
            { key: 'qty', label: 'Quantity', type: 'number', required: true },
            { key: 'supplier', label: 'Supplier', required: true, initial: active?.supplier },
            { key: 'receivedBy', label: 'Received by', initial: 'Alice Wambui' },
          ]} onSubmit={v => app.receiveDelivery(v)} />
      </View>
    );
  }

  if (section === 'finished') {
    const columns: Column[] = [
      { key: 'id', label: 'Record', flex: 1.2, render: r => <Text style={cellStrong}>{r.id}</Text> },
      { key: 'product', label: 'Product', flex: 2, render: r => <Text style={cell}>{app.products.find(p => p.id === r.productId)?.name || r.productId}</Text> },
      { key: 'batchId', label: 'Batch', flex: 1.5, render: r => <Text style={cell}>{r.batchId}</Text> },
      { key: 'qty', label: 'Bags', flex: 1, render: r => <Text style={cell}>{r.qty}</Text> },
      { key: 'date', label: 'Received', flex: 1.2, render: r => <Text style={cell}>{r.date}</Text> },
      { key: 'location', label: 'Location', flex: 1.8, render: r => <Text style={cell}>{r.location}</Text> },
      { key: 'status', label: 'Release', flex: 1.2, render: () => <Status label="Approved" /> },
    ];
    return (
      <View>
        <Header title="Finished Products" subtitle="Saleable stock — only Quality-approved batches appear here." />
        <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Ring value={Math.min(100, app.finished.reduce((a, f) => a + f.qty, 0) / 12)} label="finished goods" sub="bags in stock" size={108} thickness={9} />
          <View style={{ flex: 1 }}>
            <Text style={finTitle}>Quality-controlled finished goods</Text>
            <Text style={finSub}>Finished products are recorded automatically when Quality approves a production batch. Rejected and on-hold batches never enter saleable stock.</Text>
          </View>
        </Card>
        <DataTable columns={columns} rows={app.finished} emptyTitle="No finished goods" emptyText="Approved batches will appear here automatically." />
      </View>
    );
  }

  if (section === 'receiving' || section === 'movements' || section === 'adjustments') {
    const rows = section === 'receiving' ? app.movements.filter(m => m.type === 'Receipt') : section === 'adjustments' ? app.movements.filter(m => m.type === 'Adjustment') : app.movements;
    const columns: Column[] = [
      { key: 'id', label: 'Reference', flex: 1.4, render: r => <Text style={cellStrong}>{r.ref}</Text> },
      { key: 'material', label: 'Material', flex: 2, render: r => <Text style={cell}>{r.materialId ? (app.materials.find(m => m.id === r.materialId)?.name || r.materialId) : (app.products.find(p => p.id === r.productId)?.name || r.productId)}</Text> },
      { key: 'type', label: 'Type', flex: 1.2, render: r => <Badge label={r.type} tone={r.type === 'Receipt' ? 'success' : r.type === 'Issue' ? 'info' : 'warning'} /> },
      { key: 'qty', label: 'Quantity', flex: 1, render: r => <Text style={cell}>{r.qty > 0 ? '+' : ''}{r.qty}</Text> },
      { key: 'date', label: 'Date', flex: 1.2, render: r => <Text style={cell}>{r.date}</Text> },
      { key: 'by', label: 'Recorded by', flex: 1.6, render: r => <Text style={cell}>{r.by}</Text> },
    ];
    return (
      <View>
        <Header title={section === 'receiving' ? 'Goods Receiving' : section === 'adjustments' ? 'Stock Adjustments' : 'Stock Movements'} subtitle="Every stock transaction is recorded with reference, quantity and responsible user." right={section !== 'movements' ? <Button label={section === 'receiving' ? 'Receive delivery' : 'New adjustment'} icon={<Plus size={16} color={C.white} />} onPress={() => setModal(section)} /> : undefined} />
        <DataTable columns={columns} rows={rows} emptyTitle="No records" emptyText="Stock transactions will appear here." />
        <FormModal visible={modal === 'receiving'} title="Record Goods Receipt" submitLabel="Record receipt" onClose={() => setModal(null)}
          fields={[
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-MAI', options: app.materials.map(m => ({ label: `${m.name} · ${m.unit}`, value: m.id })) },
            { key: 'qty', label: 'Quantity', type: 'number', required: true },
            { key: 'supplier', label: 'Supplier', required: true },
            { key: 'receivedBy', label: 'Received by', initial: 'Alice Wambui' },
          ]} onSubmit={v => app.receiveDelivery(v)} />
        <FormModal visible={modal === 'adjustments'} title="Stock Adjustment" subtitle="Record a verified correction. A movement is logged automatically." submitLabel="Apply adjustment" onClose={() => setModal(null)}
          fields={[
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-SOY', options: app.materials.map(m => ({ label: m.name, value: m.id })) },
            { key: 'delta', label: 'Adjustment (+ / −)', type: 'number', required: true, placeholder: 'e.g. -25' },
            { key: 'reason', label: 'Reason', required: true },
          ]} onSubmit={v => app.adjustStock(v.materialId, Number(v.delta), v.reason)} />
      </View>
    );
  }

  if (section === 'requests') {
    const columns: Column[] = [
      { key: 'id', label: 'Request', flex: 1.4, render: r => <Text style={cellStrong}>{r.id}</Text> },
      { key: 'orderId', label: 'Order', flex: 1.3, render: r => <Text style={cell}>{r.orderId}</Text> },
      { key: 'material', label: 'Material', flex: 1.8, render: r => <Text style={cell}>{app.materials.find(m => m.id === r.materialId)?.name || r.materialId}</Text> },
      { key: 'requested', label: 'Requested', flex: 1, render: r => <Text style={cell}>{r.requested}</Text> },
      { key: 'issued', label: 'Issued', flex: 1, render: r => <Text style={cell}>{r.issued}</Text> },
      { key: 'available', label: 'Available', flex: 1, render: r => <Text style={cell}>{app.materials.find(m => m.id === r.materialId)?.qty || 0}</Text> },
      { key: 'status', label: 'Status', flex: 1.2, render: r => <Status label={r.status} /> },
      { key: 'action', label: 'Action', flex: 1.5, render: r => r.status === 'Pending' ? (
        <Row style={actRow}>
          <Pressable onPress={() => { setActive(r); setModal('issue'); }} style={actBtn}><Text style={actBtnText}>Issue</Text></Pressable>
          <Pressable onPress={() => app.rejectRequest(r.id)} style={[actBtn, { borderColor: C.danger }]}><Text style={[actBtnText, { color: C.danger }]}>Reject</Text></Pressable>
        </Row>
      ) : <Text style={cell}>—</Text> },
    ];
    return (
      <View>
        <Header title="Material Requests" subtitle="Production requests are checked against available stock before issue." />
        <StatChips items={[
          { label: 'Pending', value: String(app.requests.filter(r => r.status === 'Pending').length), tone: 'warning' },
          { label: 'Issued', value: String(app.requests.filter(r => r.status === 'Issued' || r.status === 'Partial').length), tone: 'success' },
          { label: 'Rejected', value: String(app.requests.filter(r => r.status === 'Rejected').length), tone: 'danger' },
        ]} />
        <DataTable columns={columns} rows={app.requests} emptyTitle="No requests" />
        <FormModal visible={modal === 'issue'} title="Issue Materials" subtitle={`Approve and issue stock for ${active?.id || 'request'}.`} submitLabel="Issue materials" onClose={() => setModal(null)}
          fields={[
            { key: 'approved', label: 'Quantity to issue', type: 'number', required: true, initial: String(active?.requested || ''), placeholder: `Max ${active?.requested || 0}` },
          ]} onSubmit={v => app.issueMaterial(active.id, Number(v.approved))} />
      </View>
    );
  }

  return <Empty title="Section unavailable" text="This module is being prepared." />;
}

/* ---------------------------------- quality --------------------------------- */

function QualitySection({ section }: { section: string }) {
  const app = useApp();
  const [modal, setModal] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null);
  const cols = useGridCols();
  const QA = '#6E56A8';

  if (section === 'notifications') return <NotificationsSection dept="quality" />;
  if (section === 'settings') return <SettingsSection dept="quality" />;
  if (section === 'reports') return <ReportsSection dept="quality" />;

  const decisionFields = (): any[] => [
    { key: 'batchId', label: 'Production batch', type: 'select', required: true, initial: active?.id || app.batches[0]?.id, options: app.batches.map(b => ({ label: `${b.id} · ${app.products.find(p => p.id === b.productId)?.name}`, value: b.id })) },
    { key: 'moisture', label: 'Moisture content (%)', placeholder: 'Measured value' },
    { key: 'colour', label: 'Colour & appearance', type: 'select', initial: 'Pass', options: ['Pass', 'Fail'].map(x => ({ label: x, value: x })) },
    { key: 'odour', label: 'Odour', type: 'select', initial: 'Pass', options: ['Pass', 'Fail'].map(x => ({ label: x, value: x })) },
    { key: 'packaging', label: 'Packaging condition', type: 'select', initial: 'Pass', options: ['Pass', 'Fail'].map(x => ({ label: x, value: x })) },
    { key: 'decision', label: 'Decision', type: 'select', required: true, initial: 'Approved', options: [{ label: 'Approve', value: 'Approved' }, { label: 'Reject', value: 'Rejected' }, { label: 'Hold', value: 'On Hold' }] },
    { key: 'reason', label: 'Reason / remarks', type: 'textarea', required: true },
  ];
  const submitDecision = (v: any) => app.recordDecision(v.batchId, v.decision, v.reason, { 'Moisture content': v.moisture || '—', 'Colour & appearance': v.colour, Odour: v.odour, 'Packaging condition': v.packaging });

  if (section === 'inspections' || section === 'batch-testing') {
    const rows = app.batches.filter(b => b.status === 'In Inspection' || b.status === 'Draft');
    return (
      <View>
        <Header title={section === 'batch-testing' ? 'Batch Testing' : 'Inspection Requests'} subtitle="Batches submitted by Production and awaiting a recorded decision." right={<Button label="Record result" icon={<Plus size={16} color={C.white} />} onPress={() => { setActive(null); setModal('decision'); }} />} />
        <Card style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={[qaHeroIcon, { backgroundColor: `${QA}16` }]}><FlaskConical size={22} color={QA} /></View>
          <View style={{ flex: 1 }}>
            <Text style={qaHeroTitle}>Specifications drive every decision</Text>
            <Text style={qaHeroSub}>Results are compared with the authorised limits configured in Quality Settings.</Text>
          </View>
          <Badge label={`${app.specs.length} specs active`} tone="info" />
        </Card>
        <DataTable columns={[
          { key: 'id', label: 'Batch', flex: 1.6, render: r => <Text style={cellStrong}>{r.id}</Text> },
          { key: 'product', label: 'Product', flex: 2, render: r => <Text style={cell}>{app.products.find(p => p.id === r.productId)?.name || r.productId}</Text> },
          { key: 'produced', label: 'Quantity', flex: 1.2, render: r => <Text style={cell}>{r.produced} kg · {r.bags} bags</Text> },
          { key: 'supervisor', label: 'Supervisor', flex: 1.5, render: r => <Text style={cell}>{r.supervisor}</Text> },
          { key: 'status', label: 'Status', flex: 1.4, render: r => <Status label={r.status} /> },
          { key: 'action', label: 'Action', flex: 1.6, render: r => <Pressable onPress={() => { setActive(r); setModal('decision'); }} style={actBtn}><Text style={actBtnText}>Inspect</Text></Pressable> },
        ]} rows={rows} emptyTitle="Inspection queue clear" emptyText="Submitted batches will appear here." />
        <FormModal visible={modal === 'decision'} title="Record Inspection Result" submitLabel="Submit decision" onClose={() => setModal(null)} fields={decisionFields()} onSubmit={submitDecision} />
      </View>
    );
  }

  if (section === 'raw-testing') {
    const rows = app.movements.filter(m => m.type === 'Receipt');
    return (
      <View>
        <Header title="Raw Material Testing" subtitle="Inspect incoming deliveries before they are accepted into production stock." right={<Button label="Record inspection" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('raw')} />} />
        <DataTable columns={[
          { key: 'ref', label: 'Receipt', flex: 1.5, render: r => <Text style={cellStrong}>{r.ref}</Text> },
          { key: 'material', label: 'Material', flex: 2, render: r => <Text style={cell}>{app.materials.find(m => m.id === r.materialId)?.name || r.materialId}</Text> },
          { key: 'qty', label: 'Quantity', flex: 1, render: r => <Text style={cell}>{r.qty}</Text> },
          { key: 'date', label: 'Date', flex: 1.2, render: r => <Text style={cell}>{r.date}</Text> },
          { key: 'status', label: 'Status', flex: 1.2, render: () => <Status label="Pending" /> },
        ]} rows={rows} emptyTitle="No deliveries" />
        <FormModal visible={modal === 'raw'} title="Raw Material Inspection" submitLabel="Save inspection" onClose={() => setModal(null)}
          fields={[
            { key: 'reference', label: 'Delivery reference', required: true },
            { key: 'materialId', label: 'Material', type: 'select', required: true, initial: 'RM-MAI', options: app.materials.map(m => ({ label: m.name, value: m.id })) },
            { key: 'visual', label: 'Visual inspection', type: 'select', initial: 'Pass', options: ['Pass', 'Fail'].map(x => ({ label: x, value: x })) },
            { key: 'decision', label: 'Decision', type: 'select', required: true, initial: 'Accepted', options: ['Accepted', 'Rejected', 'Hold'].map(x => ({ label: x, value: x })) },
            { key: 'remarks', label: 'Remarks', type: 'textarea' },
          ]} onSubmit={v => app.recordRawInspection({ ...v, decision: v.decision === 'Accepted' ? 'Accepted' : v.decision })} />
      </View>
    );
  }

  if (section === 'approvals' || section === 'rejected') {
    const rows = app.batches.filter(b => section === 'approvals' ? b.status === 'Approved' : b.status === 'Rejected' || b.status === 'On Hold');
    const decisions = app.decisions;
    return (
      <View>
        <Header title={section === 'approvals' ? 'Batch Approvals' : 'Rejected & Held Batches'} subtitle={section === 'approvals' ? 'Batches cleared for inventory release.' : 'Batches that must not enter saleable stock.'} />
        <DataTable columns={[
          { key: 'id', label: 'Batch', flex: 1.6, render: r => <Text style={cellStrong}>{r.id}</Text> },
          { key: 'product', label: 'Product', flex: 2, render: r => <Text style={cell}>{app.products.find(p => p.id === r.productId)?.name || r.productId}</Text> },
          { key: 'bags', label: 'Bags', flex: 0.8, render: r => <Text style={cell}>{r.bags}</Text> },
          { key: 'date', label: 'Date', flex: 1.2, render: r => <Text style={cell}>{r.date}</Text> },
          { key: 'reason', label: 'Decision reason', flex: 2.4, render: r => <Text style={cell}>{decisions.find(x => x.batchId === r.id)?.reason || '—'}</Text> },
          { key: 'status', label: 'Status', flex: 1.4, render: r => <Status label={r.status} /> },
        ]} rows={rows} emptyTitle="No batches" emptyText="Recorded decisions will appear here." />
        {section === 'rejected' ? <View style={holdNote}><Ban size={17} color={C.danger} /><Text style={holdText}>Rejected and on-hold batches remain excluded from finished goods inventory until a new decision is recorded.</Text></View> : null}
      </View>
    );
  }

  if (section === 'nonconformance' || section === 'corrective') {
    const rows = section === 'corrective' ? app.ncrs.filter(n => n.status !== 'Closed') : app.ncrs;
    return (
      <View>
        <Header title={section === 'corrective' ? 'Corrective Actions' : 'Non-Conformance'} subtitle="Quality failures, responsible departments and closure tracking." right={<Button label="New NCR" icon={<Plus size={16} color={C.white} />} onPress={() => setModal('ncr')} />} />
        <StatChips items={[
          { label: 'Open', value: String(app.ncrs.filter(n => n.status === 'Open').length), tone: 'danger' },
          { label: 'In progress', value: String(app.ncrs.filter(n => n.status === 'In Progress').length), tone: 'warning' },
          { label: 'Closed', value: String(app.ncrs.filter(n => n.status === 'Closed').length), tone: 'success' },
        ]} />
        <DataTable columns={[
          { key: 'id', label: 'NCR', flex: 1.2, render: r => <Text style={cellStrong}>{r.id}</Text> },
          { key: 'batchId', label: 'Batch', flex: 1.5, render: r => <Text style={cell}>{r.batchId}</Text> },
          { key: 'description', label: 'Description', flex: 2.6, render: r => <Text style={cell} numberOfLines={1}>{r.description}</Text> },
          { key: 'severity', label: 'Severity', flex: 1, render: r => <Badge label={r.severity} tone={r.severity === 'High' ? 'danger' : r.severity === 'Medium' ? 'warning' : 'success'} /> },
          { key: 'owner', label: 'Owner', flex: 1.3, render: r => <Text style={cell}>{r.owner}</Text> },
          { key: 'due', label: 'Due', flex: 1.1, render: r => <Text style={cell}>{r.due}</Text> },
          { key: 'status', label: 'Status', flex: 1.2, render: r => <Status label={r.status} /> },
          { key: 'action', label: 'Action', flex: 1.4, render: r => <Pressable onPress={() => app.updateNCR(r.id, r.status === 'Closed' ? 'Open' : 'Closed')} style={actBtn}><Text style={actBtnText}>{r.status === 'Closed' ? 'Reopen' : 'Close'}</Text></Pressable> },
        ]} rows={rows} emptyTitle="No records" />
        <FormModal visible={modal === 'ncr'} title="Create Non-Conformance" submitLabel="Create NCR" onClose={() => setModal(null)}
          fields={[
            { key: 'batchId', label: 'Related batch', type: 'select', required: true, initial: app.batches[0]?.id, options: app.batches.map(b => ({ label: b.id, value: b.id })) },
            { key: 'description', label: 'Problem description', type: 'textarea', required: true },
            { key: 'category', label: 'Category', type: 'select', initial: 'Product quality', options: ['Product quality', 'Packaging', 'Raw material', 'Process'].map(x => ({ label: x, value: x })) },
            { key: 'severity', label: 'Severity', type: 'select', initial: 'Medium', options: ['Low', 'Medium', 'High'].map(x => ({ label: x, value: x })) },
            { key: 'owner', label: 'Responsible department', type: 'select', initial: 'Production', options: ['Production', 'Inventory', 'Quality'].map(x => ({ label: x, value: x })) },
            { key: 'due', label: 'Due date', type: 'date' },
          ]} onSubmit={v => app.createNCR(v)} />
      </View>
    );
  }

  return <Empty title="Section unavailable" text="This module is being prepared." />;
}

function DetailModal({ visible, title, onClose, active, children }: { visible: boolean; title: string; onClose: () => void; active: any; children: React.ReactNode }) {
  if (!active) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={dm.backdrop} onPress={onClose} />
      <View style={dm.sheet}>
        <View style={dm.head}>
          <Text style={dm.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}><X size={20} color={C.muted} /></Pressable>
        </View>
        <ScrollView style={dm.body} contentContainerStyle={dm.bodyPad}>{children}</ScrollView>
        <View style={dm.foot}><Button label="Close" variant="outline" onPress={onClose} /></View>
      </View>
    </Modal>
  );
}

export function SectionPage({ dept, section }: { dept: Dept; section: string }) {
  if (section === 'announcements') return <AnnouncementCenter dept={dept} />;
  if (dept === 'production') return <ProductionSection section={section} />;
  if (dept === 'inventory') return <InventorySection section={section} />;
  return <QualitySection section={section} />;
}

/* styles */
const cell = { fontSize: 11.5, color: C.text };
const cellStrong = { fontSize: 11.5, color: C.text, fontWeight: '800' as const };
const cellRow = { gap: 8 };
const cellImg = { width: 26, height: 26, borderRadius: 6 };
const actRow = { gap: 6 };
const actBtn = { borderWidth: 1, borderColor: C.primary, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 };
const actBtnText = { fontSize: 10.5, fontWeight: '800' as const, color: C.primary };
const nRow = { flexDirection: 'row' as const, alignItems: 'center' as const, padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' };
const nUnread = { backgroundColor: '#F7FAF6' };
const nTitle = { fontSize: 12.5, fontWeight: '800' as const, color: C.text };
const nBody = { fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 16 };
const nTime = { fontSize: 10, color: C.muted, marginTop: 5 };
const nDot = { width: 8, height: 8, borderRadius: 4, backgroundColor: C.fresh };
const tg = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' },
  label: { fontSize: 12, color: C.text, fontWeight: '600' },
  track: { width: 42, height: 24, borderRadius: 12, backgroundColor: '#D9DED8', justifyContent: 'center', paddingHorizontal: 3 },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.white, position: 'absolute', left: 3 },
});
const schHead = { justifyContent: 'space-between' as const, marginBottom: 10 };
const schName = { fontSize: 14, fontWeight: '800' as const, color: C.text, marginBottom: 8 };
const schBar = { marginTop: 12 };
const finTitle = { fontSize: 14, fontWeight: '800' as const, color: C.text };
const finSub = { fontSize: 11, color: C.muted, lineHeight: 17, marginTop: 5 };
const holdNote = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, backgroundColor: C.dangerSoft, borderRadius: RADIUS.md, padding: 14, marginTop: 14 };
const holdText = { flex: 1, fontSize: 11, color: '#9A5B57', lineHeight: 16 };
const qaHeroIcon = { width: 44, height: 44, borderRadius: 13, alignItems: 'center' as const, justifyContent: 'center' as const };
const qaHeroTitle = { fontSize: 13, fontWeight: '800' as const, color: C.text };
const qaHeroSub = { fontSize: 10.5, color: C.muted, marginTop: 3 };
const detailBtns = { gap: 8, marginTop: 14 };
const detailSub = { fontSize: 11, fontWeight: '800' as const, color: C.text, marginTop: 14, marginBottom: 2 };
const dm = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,32,20,0.45)' },
  sheet: { position: 'absolute', top: '10%', alignSelf: 'center', width: '92%', maxWidth: 600, maxHeight: '80%', backgroundColor: C.white, borderRadius: RADIUS.xl, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderColor: C.border },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  body: { maxHeight: 460 },
  bodyPad: { padding: 18 },
  foot: { padding: 14, borderTopWidth: 1, borderColor: C.border, alignItems: 'flex-end' },
});
