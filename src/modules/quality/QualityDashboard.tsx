import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  FlaskConical, ClipboardCheck, ShieldCheck, Ban, Clock3, AlertTriangle, Plus,
  ArrowUpRight, ChevronRight, Beaker, CheckCircle2, Microscope, FileText, Settings2,
  TrendingUp, Activity, CircleDot, XCircle,
} from 'lucide-react-native';
import { C, RADIUS, SHADOW } from '../../theme';
import { useApp } from '../../store';
import { IMG } from '../../assets';
import { HeroCarousel } from '../../components/HeroCarousel';
import { Ring, Trend, StackBar } from '../../components/charts';
import { Card, Kpi, SectionHead, Badge, Button, Row, Dot, gridWrap, gridItem, useGridCols, IconBox, Progress } from '../../components/ui';
import { FormModal } from '../../components/Records';

const QA = '#6E56A8';

const slides = [
  { image: IMG.qualityHero[0], eyebrow: 'Quality Assurance · HAPFAM', title: 'Quality First.\nAlways.', subtitle: 'Every batch tested. Every result traceable.', accent: C.fresh },
  { image: IMG.qualityHero[1], eyebrow: 'Laboratory Control', title: 'Test. Verify. Assure.', subtitle: 'Configured specifications — never assumed limits', accent: C.fresh },
  { image: IMG.qualityHero[2], eyebrow: 'Product Release', title: 'Only the Best Reaches\nOur Customers', subtitle: 'Approve, reject or hold — with a complete audit trail', accent: C.fresh },
];

export function QualityDashboard() {
  const app = useApp();
  const router = useRouter();
  const cols = useGridCols();
  const { width } = useWindowDimensions();
  const [decide, setDecide] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const inspected = app.inspections.length;
  const passed = app.inspections.filter(i => i.decision === 'Pass').length;
  const passRate = Math.round((passed / Math.max(inspected, 1)) * 100);
  const approved = app.batches.filter(b => b.status === 'Approved').length;
  const rejected = app.batches.filter(b => b.status === 'Rejected').length;
  const inInspection = app.batches.filter(b => b.status === 'In Inspection').length;
  const openNcr = app.ncrs.filter(n => n.status !== 'Closed').length;

  const queue = app.batches.filter(b => b.status === 'In Inspection' || b.status === 'Draft');

  return (
    <View>
      {/* page header */}
      <View style={[head, width < 720 && { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, minWidth: 0, width: width < 720 ? '100%' : undefined }}>
          <Row style={eyebrowRow}>
            <View style={qaTag}><Microscope size={12} color={C.white} /></View>
            <Text style={eyebrow}>DEPARTMENT 03 · QUALITY ASSURANCE & QUALITY CONTROL</Text>
          </Row>
          <Text style={title}>Quality Control Center</Text>
          <Text style={sub}>Inspect, verify and release every batch against HAPFAM's configured specifications.</Text>
        </View>
        <View style={{ ...headRight, ...(width < 720 ? { width: '100%' as const } : {}) }}>
          <View style={datePill}><Activity size={14} color={C.primary} /><Text style={dateText}>Lab systems operational</Text></View>
          <Button label="Record inspection" icon={<Plus size={16} color={C.white} />} onPress={() => setDecide(true)} />
        </View>
      </View>

      {/* hero carousel */}
      <HeroCarousel slides={slides} height={348} />

      {/* quality pulse banner */}
      <Card style={{ ...pulse, ...(width < 720 ? { flexDirection: 'column' as const, alignItems: 'flex-start' as const } : {}) }}>
        <View style={[pulseAccent, { backgroundColor: QA }]} />
        <View style={pulseLeft}>
          <Text style={pulseEyebrow}>QUALITY PULSE · LIVE</Text>
          <Text style={pulseTitle}>Laboratory performance at a glance</Text>
          <Text style={pulseSub}>Decisions recorded against configured HAPFAM specifications.</Text>
          <Row style={pulseChips}>
            <View style={pulseChip}><CheckCircle2 size={15} color={C.primary} /><Text style={pulseChipText}>{approved} approved</Text></View>
            <View style={pulseChip}><XCircle size={15} color={C.danger} /><Text style={pulseChipText}>{rejected} rejected</Text></View>
            <View style={pulseChip}><Clock3 size={15} color={C.warning} /><Text style={pulseChipText}>{inInspection} pending</Text></View>
          </Row>
        </View>
        <View style={[pulseRight, width < 720 && { marginLeft: 0, marginTop: 14, alignSelf: 'center' }]}>
          <Ring value={passRate} label="pass rate" sub={`${inspected} inspections`} tone="success" size={132} thickness={11} />
        </View>
      </Card>

      <View style={{ height: 18 }} />
      <View style={gridWrap(14)}>
        <View style={gridItem(cols)}><Kpi icon={<ShieldCheck size={19} color={C.primary} />} label="Quality Pass Rate" value={`${passRate}%`} progress={passRate} sub="Based on recorded decisions" tone="success" /></View>
        <View style={gridItem(cols)}><Kpi icon={<ClipboardCheck size={19} color={C.info} />} label="Inspections Today" value={String(app.inspections.filter(i => i.date === new Date().toISOString().slice(0, 10)).length + (inInspection ? 1 : 0))} sub={`${inspected} on record`} tone="info" /></View>
        <View style={gridItem(cols)}><Kpi icon={<CheckCircle2 size={19} color={C.fresh} />} label="Approved Batches" value={String(approved)} sub="Released to inventory" tone="fresh" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Ban size={19} color={C.danger} />} label="Rejected Batches" value={String(rejected)} sub="Held from saleable stock" tone="danger" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Beaker size={19} color={C.warning} />} label="Pending Tests" value={String(inInspection)} sub="Awaiting inspection" tone="warning" /></View>
        <View style={gridItem(cols)}><Kpi icon={<AlertTriangle size={19} color={QA} />} label="Open Non-Conformances" value={String(openNcr)} sub="Corrective actions outstanding" tone="warning" badge="Review" /></View>
      </View>

      {/* product gallery */}
      <View style={{ height: 28 }} />
      <SectionHead eyebrow="Product quality" title="Product Gallery" subtitle="Inspect each HAPFAM porridge flour line against its specification" action="View reports" onAction={() => router.push('/quality/reports' as any)} />
      <View style={gridWrap(16)}>
        {app.products.map(p => {
          const related = app.inspections.filter(i => i.productId === p.id);
          const last = related[0];
          return (
            <View key={p.id} style={gridItem(cols)}>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={[galleryImg, { backgroundColor: `${p.color}12` }]}>
                  <Image source={p.image} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                  <View style={galleryCorner}><View style={[qaMini, { backgroundColor: QA }]}><Text style={qaMiniText}>QA</Text></View></View>
                </View>
                <View style={{ padding: 15 }}>
                  <Text style={galleryName}>HAPFAM {p.flavor} Porridge</Text>
                  <Text style={galleryDesc}>{p.description}</Text>
                  <Row style={galleryMeta}>
                    <View style={galleryStat}><Text style={galleryVal}>{related.length}</Text><Text style={galleryLab}>Inspections</Text></View>
                    <View style={galleryStat}><Text style={galleryVal}>{app.specs.length}</Text><Text style={galleryLab}>Spec tests</Text></View>
                    <Badge label={last ? (last.decision === 'Pass' ? 'Passed' : last.decision === 'Fail' ? 'Failed' : 'Held') : 'Not tested'} tone={last?.decision === 'Pass' ? 'success' : last?.decision === 'Fail' ? 'danger' : 'neutral'} />
                  </Row>
                  <Pressable onPress={() => router.push('/quality/batch-testing' as any)} style={galleryBtn}>
                    <Text style={galleryBtnText}>Inspect batch</Text><ArrowUpRight size={14} color={C.white} />
                  </Pressable>
                </View>
              </Card>
            </View>
          );
        })}
      </View>

      {/* analytics row */}
      <View style={{ height: 28 }} />
      <View style={gridWrap(14)}>
        <View style={[gridItem(cols >= 3 ? 2 : 1)]}>
          <Card>
            <SectionHead eyebrow="Trend analysis" title="Quality Performance" subtitle="Inspection outcomes across recent batches" action="Quality reports" onAction={() => router.push('/quality/reports' as any)} />
            <Trend points={[62, 70, 66, 78, 74, 86, 82, 91, 88, passRate || 88]} tone="success" height={140} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'Now']} />
            <View style={decisionWrap}>
              <Text style={decisionLabel}>Decision distribution</Text>
              <StackBar segments={[{ value: approved, tone: 'success' }, { value: rejected, tone: 'danger' }, { value: inInspection, tone: 'warning' }]} height={13} />
              <Row style={decisionLegend}>
                <Row style={legendItem}><Dot tone="success" /><Text style={legendText}>Approved {approved}</Text></Row>
                <Row style={legendItem}><Dot tone="danger" /><Text style={legendText}>Rejected {rejected}</Text></Row>
                <Row style={legendItem}><Dot tone="warning" /><Text style={legendText}>Pending {inInspection}</Text></Row>
              </Row>
            </View>
          </Card>
        </View>
        <View style={[gridItem(cols >= 3 ? 1 : 1)]}>
          <Card>
            <SectionHead eyebrow="Configuration" title="Quality Specifications" subtitle="Authorised limits only — no assumed values" />
            <Text style={specNote}>Tests are compared against specifications configured by authorised quality staff.</Text>
            {app.specs.slice(0, 4).map(sp => (
              <Row key={sp.id} style={specRow}>
                <View style={specDot}><Beaker size={13} color={QA} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={specName}>{sp.test}</Text>
                  <Text style={specVal}>{sp.min !== '—' || sp.max !== '—' ? `${sp.min} – ${sp.max} ${sp.unit}` : sp.method}</Text>
                </View>
                <Badge label={sp.product} tone="neutral" />
              </Row>
            ))}
            <Pressable onPress={() => router.push('/quality/settings' as any)} style={specLink}><Text style={specLinkText}>Manage specifications</Text><Settings2 size={14} color={QA} /></Pressable>
          </Card>
        </View>
      </View>

      {/* inspection queue */}
      <View style={{ height: 28 }} />
      <Card>
        <SectionHead eyebrow="Action required" title="Inspection Queue" subtitle="Batches submitted by Production awaiting a quality decision" action="All requests" onAction={() => router.push('/quality/inspections' as any)} />
        {queue.length === 0 ? (
          <View style={emptyQ}><View style={[qaMini, { backgroundColor: C.successSoft }]}><CheckCircle2 size={22} color={C.primary} /></View><Text style={emptyQT}>Queue is clear</Text><Text style={emptyQS}>All submitted batches have a recorded decision.</Text></View>
        ) : queue.map(b => {
          const p = app.products.find(x => x.id === b.productId);
          return (
            <Row key={b.id} style={qRow}>
              <View style={[qThumb, { backgroundColor: `${p?.color}18` }]}><Image source={p?.image} style={{ width: '100%', height: '100%' }} contentFit="contain" /></View>
              <View style={{ flex: 1 }}>
                <Text style={qTitle}>{b.id}</Text>
                <Text style={qSub}>{p?.name} · {b.bags} bags · {b.supervisor}</Text>
              </View>
              <Badge label={b.status} tone={b.status === 'In Inspection' ? 'info' : 'warning'} />
              <Pressable onPress={() => { setSelected(b.id); setDecide(true); }} style={qBtn}><Text style={qBtnText}>Record result</Text><ChevronRight size={14} color={C.white} /></Pressable>
            </Row>
          );
        })}
      </Card>

      {/* NCR + decisions */}
      <View style={{ height: 28 }} />
      <View style={gridWrap(14)}>
        <View style={[gridItem(cols >= 3 ? 1 : 1)]}>
          <Card>
            <SectionHead eyebrow="Quality system" title="Non-Conformance" subtitle="Open issues requiring corrective action" action="Manage" onAction={() => router.push('/quality/nonconformance' as any)} />
            {app.ncrs.slice(0, 4).map(n => (
              <Pressable key={n.id} onPress={() => router.push('/quality/nonconformance' as any)} style={ncrRow}>
                <View style={[ncrSev, { backgroundColor: n.severity === 'High' ? C.dangerSoft : n.severity === 'Medium' ? C.warningSoft : C.successSoft }]}>
                  <AlertTriangle size={14} color={n.severity === 'High' ? C.danger : n.severity === 'Medium' ? C.warning : C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ncrTitle}>{n.id} · {n.batchId}</Text>
                  <Text style={ncrDesc} numberOfLines={1}>{n.description}</Text>
                </View>
                <Badge label={n.status} tone={n.status === 'Closed' ? 'success' : n.status === 'Open' ? 'danger' : 'warning'} />
              </Pressable>
            ))}
          </Card>
        </View>
        <View style={[gridItem(cols >= 3 ? 2 : 1)]}>
          <Card>
            <SectionHead eyebrow="Audit trail" title="Recent Quality Decisions" subtitle="Every decision is traceable to its batch and inspector" />
            {app.decisions.slice(0, 5).map(dec => (
              <Row key={dec.id} style={decRow}>
                <View style={[decIcon, { backgroundColor: dec.decision === 'Approved' ? C.successSoft : dec.decision === 'Rejected' ? C.dangerSoft : C.warningSoft }]}>
                  {dec.decision === 'Approved' ? <CheckCircle2 size={16} color={C.primary} /> : dec.decision === 'Rejected' ? <Ban size={16} color={C.danger} /> : <Clock3 size={16} color={C.warning} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={decTitle}>{dec.batchId} · {dec.decision}</Text>
                  <Text style={decSub} numberOfLines={1}>{dec.reason}</Text>
                </View>
                <Text style={decBy}>{dec.by}</Text>
                <Text style={decDate}>{dec.date}</Text>
              </Row>
            ))}
          </Card>
        </View>
      </View>

      <FormModal visible={decide} title="Record Inspection Result" subtitle="Results are checked against configured specifications before a decision is recorded."
        submitLabel="Submit decision" onClose={() => { setDecide(false); setSelected(null); }}
        fields={[
          { key: 'batchId', label: 'Production batch', type: 'select', required: true, initial: selected || queue[0]?.id, options: queue.map(b => ({ label: `${b.id} · ${app.products.find(p => p.id === b.productId)?.name}`, value: b.id })) },
          { key: 'moisture', label: 'Moisture content (%)', placeholder: 'Measured value' },
          { key: 'colour', label: 'Colour & appearance', type: 'select', initial: 'Pass', options: [{ label: 'Pass', value: 'Pass' }, { label: 'Fail', value: 'Fail' }] },
          { key: 'odour', label: 'Odour', type: 'select', initial: 'Pass', options: [{ label: 'Pass', value: 'Pass' }, { label: 'Fail', value: 'Fail' }] },
          { key: 'packaging', label: 'Packaging condition', type: 'select', initial: 'Pass', options: [{ label: 'Pass', value: 'Pass' }, { label: 'Fail', value: 'Fail' }] },
          { key: 'decision', label: 'Quality decision', type: 'select', required: true, initial: 'Approved', options: [{ label: 'Approve batch', value: 'Approved' }, { label: 'Reject batch', value: 'Rejected' }, { label: 'Place on hold', value: 'On Hold' }] },
          { key: 'reason', label: 'Decision reason / remarks', type: 'textarea', required: true, placeholder: 'State the basis for this decision' },
        ]}
        onSubmit={v => app.recordDecision(v.batchId, v.decision as any, v.reason, {
          'Moisture content': v.moisture || '—', 'Colour & appearance': v.colour, Odour: v.odour, 'Packaging condition': v.packaging,
        })} />
    </View>
  );
}

const head = { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 22, gap: 16, flexWrap: 'wrap' } as const;
const eyebrowRow = { gap: 7, marginBottom: 2 } as const;
const qaTag = { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' } as const;
const eyebrow = { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, color: QA } as const;
const title = { fontSize: 29, fontWeight: '800', color: C.text, letterSpacing: -0.8, marginTop: 6 } as const;
const sub = { fontSize: 15, color: C.muted, marginTop: 6 } as const;
const headRight = { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' } as const;
const datePill = { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.pill, paddingHorizontal: 14, height: 42 } as const;
const dateText = { fontSize: 14, color: C.muted, fontWeight: '600' } as const;

const pulse = { flexDirection: 'row', alignItems: 'center', overflow: 'hidden', paddingVertical: 20, paddingRight: 22, paddingLeft: 26, minHeight: 150 } as const;
const pulseAccent = { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 } as const;
const pulseLeft = { flex: 1 } as const;
const pulseEyebrow = { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: QA } as const;
const pulseTitle = { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 6, letterSpacing: -0.4 } as const;
const pulseSub = { fontSize: 13, color: C.muted, marginTop: 5 } as const;
const pulseChips = { gap: 9, marginTop: 14, flexWrap: 'wrap' } as const;
const pulseChip = { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.cream, borderRadius: RADIUS.pill, paddingHorizontal: 11, paddingVertical: 6 } as const;
const pulseChipText = { fontSize: 13, fontWeight: '700', color: C.text } as const;
const pulseRight = { marginLeft: 18, alignItems: 'center' } as const;

const galleryImg = { height: 186, alignItems: 'center', justifyContent: 'center' } as const;
const galleryCorner = { position: 'absolute', right: 12, top: 12 } as const;
const qaMini = { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' } as const;
const qaMiniText = { color: C.white, fontSize: 12, fontWeight: '800' } as const;
const galleryName = { fontSize: 16, fontWeight: '800', color: C.text } as const;
const galleryDesc = { fontSize: 12, color: C.muted, lineHeight: 18, marginTop: 5, minHeight: 32 } as const;
const galleryMeta = { justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: C.border } as const;
const galleryStat = { alignItems: 'flex-start' } as const;
const galleryVal = { fontSize: 18, fontWeight: '800', color: C.forest } as const;
const galleryLab = { fontSize: 10, color: C.muted } as const;
const galleryBtn = { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.forest, borderRadius: RADIUS.sm, paddingVertical: 10, marginTop: 13 } as const;
const galleryBtnText = { color: C.white, fontSize: 13, fontWeight: '800' } as const;

const decisionWrap = { marginTop: 18 } as const;
const decisionLabel = { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 9 } as const;
const decisionLegend = { gap: 16, marginTop: 10, flexWrap: 'wrap' } as const;
const legendItem = { gap: 6 } as const;
const legendText = { fontSize: 12, color: C.muted } as const;

const specNote = { fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 10 } as const;
const specRow = { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F0F2ED', gap: 9 } as const;
const specDot = { width: 26, height: 26, borderRadius: 8, backgroundColor: `${QA}14`, alignItems: 'center' as const, justifyContent: 'center' as const } as const;
const specName = { fontSize: 13, fontWeight: '700', color: C.text } as const;
const specVal = { fontSize: 12, color: C.muted, marginTop: 2 } as const;
const specLink = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 13 } as const;
const specLinkText = { fontSize: 13, fontWeight: '800', color: QA } as const;

const emptyQ = { alignItems: 'center', paddingVertical: 34 } as const;
const emptyQT = { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 9 } as const;
const emptyQS = { fontSize: 13, color: C.muted, marginTop: 3 } as const;
const qRow = { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2ED', flexWrap: 'wrap' } as const;
const qThumb = { width: 46, height: 46, borderRadius: 10 } as const;
const qTitle = { fontSize: 14, fontWeight: '800', color: C.text } as const;
const qSub = { fontSize: 12, color: C.muted, marginTop: 3 } as const;
const qBtn = { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.forest, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 9 } as const;
const qBtnText = { color: C.white, fontSize: 13, fontWeight: '800' } as const;

const ncrRow = { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' } as const;
const ncrSev = { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' } as const;
const ncrTitle = { fontSize: 13, fontWeight: '800', color: C.text } as const;
const ncrDesc = { fontSize: 12, color: C.muted, marginTop: 2 } as const;
const decRow = { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' } as const;
const decIcon = { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' } as const;
const decTitle = { fontSize: 13, fontWeight: '800', color: C.text } as const;
const decSub = { fontSize: 12, color: C.muted, marginTop: 2 } as const;
const decBy = { fontSize: 12, color: C.muted, fontWeight: '600' } as const;
const decDate = { fontSize: 12, color: C.muted } as const;
