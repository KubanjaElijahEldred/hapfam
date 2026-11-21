import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { IMG } from './assets';
import { records as recordApi, request as apiRequest } from './services/backend';
import type {
  Activity, AppNotification, Batch, Decision, Dept, FinishedGood, Flavor,
  Inspection, Material, MaterialRequest, Movement, NCR, ProductionOrder,
  Product, QualitySpec,
} from './types';

/* ------------------------------------------------------------------ *
 * HAPFAM shared data service (demonstration adapter).
 * All three department workspaces read and write this ONE store, so an
 * action in Inventory is immediately visible in Production and Quality.
 * The service layer mirrors REST resources so it can be swapped for a
 * live Express/Prisma API without changing any screen.
 * ------------------------------------------------------------------ */

const d = (offset = 0) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};
const t = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
let seq = 100;
const uid = (p: string) => `${p}-${++seq}`;

export interface AppState {
  demo: boolean;
  products: Product[];
  materials: Material[];
  orders: ProductionOrder[];
  batches: Batch[];
  requests: MaterialRequest[];
  movements: Movement[];
  inspections: Inspection[];
  decisions: Decision[];
  ncrs: NCR[];
  finished: FinishedGood[];
  notifications: AppNotification[];
  activities: Activity[];
  specs: QualitySpec[];
}

const initial: AppState = {
  demo: true,
  products: [
    { id: 'PRD-SOY', name: 'Soya Porridge Flour', flavor: 'Soya', image: IMG.productSoya, description: 'Protein-rich porridge flour made from carefully milled soya beans.', color: '#E9A23B', unit: 'bags' },
    { id: 'PRD-RIC', name: 'Rice Porridge Flour', flavor: 'Rice', image: IMG.productRice, description: 'Light, easily digestible porridge flour from selected rice grain.', color: '#C8B88E', unit: 'bags' },
    { id: 'PRD-MAI', name: 'Maize Porridge Flour', flavor: 'Maize', image: IMG.productMaize, description: 'Wholegrain maize flour for a wholesome, energy-rich porridge.', color: '#8CCF45', unit: 'bags' },
  ],
  materials: [
    { id: 'RM-SOY', name: 'Soya Beans', category: 'Raw Material', unit: 'kg', qty: 4820, reorder: 1500, image: IMG.soya, location: 'Warehouse A · Bay 1', supplier: 'Greenfields Agri', expiry: d(150) },
    { id: 'RM-RIC', name: 'Rice', category: 'Raw Material', unit: 'kg', qty: 6340, reorder: 2000, image: IMG.rice, location: 'Warehouse A · Bay 2', supplier: 'Mwea Growers Co-op', expiry: d(200) },
    { id: 'RM-MAI', name: 'Maize', category: 'Raw Material', unit: 'kg', qty: 9150, reorder: 2500, image: IMG.maize, location: 'Warehouse B · Bay 1', supplier: 'Nakuru Cereals', expiry: d(180) },
    { id: 'PM-BAG', name: 'Packaging Bags', category: 'Packaging', unit: 'pcs', qty: 740, reorder: 500, image: IMG.bags, location: 'Warehouse C · Shelf 3', supplier: 'Kraft Packaging Ltd' },
    { id: 'PM-LBL', name: 'Packaging Labels', category: 'Packaging', unit: 'pcs', qty: 320, reorder: 600, image: IMG.labels, location: 'Warehouse C · Shelf 4', supplier: 'Kraft Packaging Ltd' },
  ],
  orders: [
    { id: 'PO-2026-014', productId: 'PRD-SOY', qty: 2000, unit: 'kg', start: d(-2), due: d(2), supervisor: 'Daniel Ochieng', priority: 'High', status: 'In Progress', instructions: 'Fine grind, standard 2 kg packing.', createdAt: d(-3) },
    { id: 'PO-2026-015', productId: 'PRD-MAI', qty: 3200, unit: 'kg', start: d(-1), due: d(3), supervisor: 'Sarah Njeri', priority: 'Normal', status: 'In Progress', instructions: 'Wholegrain grade A.', createdAt: d(-2) },
    { id: 'PO-2026-016', productId: 'PRD-RIC', qty: 1500, unit: 'kg', start: d(0), due: d(4), supervisor: 'Peter Kiptoo', priority: 'Normal', status: 'Planned', instructions: 'Standard rice flour.', createdAt: d(-1) },
    { id: 'PO-2026-017', productId: 'PRD-SOY', qty: 1800, unit: 'kg', start: d(-5), due: d(-1), supervisor: 'Daniel Ochieng', priority: 'High', status: 'Completed', createdAt: d(-6) },
    { id: 'PO-2026-018', productId: 'PRD-MAI', qty: 2400, unit: 'kg', start: d(-4), due: d(1), supervisor: 'Sarah Njeri', priority: 'Low', status: 'On Hold', instructions: 'Awaiting packaging labels.', createdAt: d(-5) },
  ],
  batches: [
    { id: 'BAT-SOY-014', orderId: 'PO-2026-014', productId: 'PRD-SOY', produced: 960, bags: 480, consumed: { 'RM-SOY': 1020, 'PM-BAG': 480 }, wastage: 22, supervisor: 'Daniel Ochieng', date: d(-1), status: 'In Inspection' },
    { id: 'BAT-MAI-015', orderId: 'PO-2026-015', productId: 'PRD-MAI', produced: 1480, bags: 740, consumed: { 'RM-MAI': 1560, 'PM-BAG': 740 }, wastage: 31, supervisor: 'Sarah Njeri', date: d(0), status: 'Draft' },
    { id: 'BAT-RIC-013', orderId: 'PO-2026-013', productId: 'PRD-RIC', produced: 1450, bags: 725, consumed: { 'RM-RIC': 1520, 'PM-BAG': 725 }, wastage: 18, supervisor: 'Peter Kiptoo', date: d(-3), status: 'Approved' },
    { id: 'BAT-MAI-011', orderId: 'PO-2026-011', productId: 'PRD-MAI', produced: 1880, bags: 940, consumed: { 'RM-MAI': 1960, 'PM-BAG': 940 }, wastage: 24, supervisor: 'Sarah Njeri', date: d(-4), status: 'Approved' },
    { id: 'BAT-SOY-010', orderId: 'PO-2026-010', productId: 'PRD-SOY', produced: 1640, bags: 820, consumed: { 'RM-SOY': 1710, 'PM-BAG': 820 }, wastage: 19, supervisor: 'Daniel Ochieng', date: d(-5), status: 'Approved' },
    { id: 'BAT-RIC-009', orderId: 'PO-2026-009', productId: 'PRD-RIC', produced: 1380, bags: 690, consumed: { 'RM-RIC': 1450, 'PM-BAG': 690 }, wastage: 16, supervisor: 'Peter Kiptoo', date: d(-7), status: 'Approved' },
    { id: 'BAT-MAI-008', orderId: 'PO-2026-008', productId: 'PRD-MAI', produced: 1920, bags: 960, consumed: { 'RM-MAI': 2010, 'PM-BAG': 960 }, wastage: 28, supervisor: 'Sarah Njeri', date: d(-8), status: 'Approved' },
    { id: 'BAT-SOY-007', orderId: 'PO-2026-007', productId: 'PRD-SOY', produced: 1580, bags: 790, consumed: { 'RM-SOY': 1650, 'PM-BAG': 790 }, wastage: 21, supervisor: 'Daniel Ochieng', date: d(-9), status: 'Approved' },
    { id: 'BAT-RIC-006', orderId: 'PO-2026-006', productId: 'PRD-RIC', produced: 1410, bags: 705, consumed: { 'RM-RIC': 1480, 'PM-BAG': 705 }, wastage: 17, supervisor: 'Peter Kiptoo', date: d(-11), status: 'Approved' },
    { id: 'BAT-MAI-005', orderId: 'PO-2026-005', productId: 'PRD-MAI', produced: 1860, bags: 930, consumed: { 'RM-MAI': 1940, 'PM-BAG': 930 }, wastage: 26, supervisor: 'Sarah Njeri', date: d(-13), status: 'Approved' },
    { id: 'BAT-SOY-012', orderId: 'PO-2026-012', productId: 'PRD-SOY', produced: 1720, bags: 860, consumed: { 'RM-SOY': 1810, 'PM-BAG': 860 }, wastage: 40, supervisor: 'Daniel Ochieng', date: d(-6), status: 'Rejected' },
  ],
  requests: [
    { id: 'MR-2026-021', orderId: 'PO-2026-014', materialId: 'RM-SOY', requested: 1200, approved: 1100, issued: 1100, status: 'Issued', requester: 'Daniel Ochieng', date: d(-1) },
    { id: 'MR-2026-022', orderId: 'PO-2026-015', materialId: 'RM-MAI', requested: 1600, approved: 1600, issued: 1600, status: 'Issued', requester: 'Sarah Njeri', date: d(0) },
    { id: 'MR-2026-023', orderId: 'PO-2026-015', materialId: 'PM-BAG', requested: 800, approved: 0, issued: 0, status: 'Pending', requester: 'Sarah Njeri', date: d(0) },
    { id: 'MR-2026-024', orderId: 'PO-2026-016', materialId: 'RM-RIC', requested: 1600, approved: 0, issued: 0, status: 'Pending', requester: 'Peter Kiptoo', date: d(0) },
  ],
  movements: [
    { id: 'MOV-301', materialId: 'RM-MAI', type: 'Receipt', qty: 3000, ref: 'GRN-2026-088', date: d(-2), by: 'Alice Wambui' },
    { id: 'MOV-302', materialId: 'RM-SOY', type: 'Issue', qty: 1100, ref: 'MR-2026-021', date: d(-1), by: 'Alice Wambui' },
    { id: 'MOV-303', productId: 'PRD-RIC', type: 'Finished Goods', qty: 725, ref: 'BAT-RIC-013', date: d(-3), by: 'Alice Wambui' },
    { id: 'MOV-304', materialId: 'RM-RIC', type: 'Receipt', qty: 2200, ref: 'GRN-2026-089', date: d(-1), by: 'Alice Wambui' },
  ],
  inspections: [
    { id: 'INSP-201', batchId: 'BAT-RIC-013', productId: 'PRD-RIC', inspector: 'Grace Akinyi', date: d(-2), results: { 'Moisture': '11.8%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Within configured specification.' },
    { id: 'INSP-202', batchId: 'BAT-SOY-012', productId: 'PRD-SOY', inspector: 'Grace Akinyi', date: d(-5), results: { 'Moisture': '14.6%', 'Colour': 'Fail', 'Odour': 'Pass' }, decision: 'Fail', comments: 'Off-spec colour; batch held.' },
    { id: 'INSP-203', batchId: 'BAT-MAI-011', productId: 'PRD-MAI', inspector: 'Grace Akinyi', date: d(-3), results: { 'Moisture': '11.2%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-204', batchId: 'BAT-SOY-010', productId: 'PRD-SOY', inspector: 'Samuel Odhiambo', date: d(-4), results: { 'Moisture': '11.9%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-205', batchId: 'BAT-RIC-009', productId: 'PRD-RIC', inspector: 'Grace Akinyi', date: d(-6), results: { 'Moisture': '11.4%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-206', batchId: 'BAT-MAI-008', productId: 'PRD-MAI', inspector: 'Samuel Odhiambo', date: d(-7), results: { 'Moisture': '11.1%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-207', batchId: 'BAT-SOY-007', productId: 'PRD-SOY', inspector: 'Grace Akinyi', date: d(-9), results: { 'Moisture': '12.0%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-208', batchId: 'BAT-RIC-006', productId: 'PRD-RIC', inspector: 'Samuel Odhiambo', date: d(-11), results: { 'Moisture': '11.6%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
    { id: 'INSP-209', batchId: 'BAT-MAI-005', productId: 'PRD-MAI', inspector: 'Grace Akinyi', date: d(-13), results: { 'Moisture': '11.3%', 'Colour': 'Pass', 'Odour': 'Pass' }, decision: 'Pass', comments: 'Conforms to specification.' },
  ],
  decisions: [
    { id: 'DEC-101', batchId: 'BAT-RIC-013', decision: 'Approved', reason: 'All tests within specification.', by: 'Grace Akinyi', date: d(-2) },
    { id: 'DEC-102', batchId: 'BAT-SOY-012', decision: 'Rejected', reason: 'Colour outside HAPFAM specification.', by: 'Grace Akinyi', date: d(-5) },
    { id: 'DEC-103', batchId: 'BAT-MAI-011', decision: 'Approved', reason: 'All tests within specification.', by: 'Grace Akinyi', date: d(-3) },
    { id: 'DEC-104', batchId: 'BAT-SOY-010', decision: 'Approved', reason: 'All tests within specification.', by: 'Samuel Odhiambo', date: d(-4) },
    { id: 'DEC-105', batchId: 'BAT-RIC-009', decision: 'Approved', reason: 'All tests within specification.', by: 'Grace Akinyi', date: d(-6) },
    { id: 'DEC-106', batchId: 'BAT-MAI-008', decision: 'Approved', reason: 'All tests within specification.', by: 'Samuel Odhiambo', date: d(-7) },
    { id: 'DEC-107', batchId: 'BAT-SOY-007', decision: 'Approved', reason: 'All tests within specification.', by: 'Grace Akinyi', date: d(-9) },
    { id: 'DEC-108', batchId: 'BAT-RIC-006', decision: 'Approved', reason: 'All tests within specification.', by: 'Samuel Odhiambo', date: d(-11) },
    { id: 'DEC-109', batchId: 'BAT-MAI-005', decision: 'Approved', reason: 'All tests within specification.', by: 'Grace Akinyi', date: d(-13) },
  ],
  ncrs: [
    { id: 'NCR-401', batchId: 'BAT-SOY-012', description: 'Discolouration detected in finished soya flour.', category: 'Product quality', severity: 'High', status: 'Open', owner: 'Production', date: d(-5), due: d(-1) },
    { id: 'NCR-402', batchId: 'BAT-RIC-013', description: 'Label alignment drift on 4 bags.', category: 'Packaging', severity: 'Low', status: 'In Progress', owner: 'Production', date: d(-2), due: d(1) },
  ],
  finished: [
    { id: 'FG-501', productId: 'PRD-RIC', batchId: 'BAT-RIC-013', qty: 725, date: d(-3), location: 'Finished goods · Rack 2' },
  ],
  notifications: [
    { id: 'N-01', dept: 'inventory', title: 'Material request pending', body: 'PO-2026-015 requires 800 packaging bags. Review and issue.', time: '09:12', read: false, tone: 'warning' },
    { id: 'N-02', dept: 'quality', title: 'New inspection request', body: 'Batch BAT-SOY-014 is awaiting quality inspection.', time: '08:47', read: false, tone: 'info' },
    { id: 'N-03', dept: 'production', title: 'Batch approved', body: 'BAT-RIC-013 passed quality inspection and was released.', time: 'Yesterday', read: false, tone: 'success' },
    { id: 'N-04', dept: 'production', title: 'Batch rejected', body: 'BAT-SOY-012 was rejected. See non-conformance NCR-401.', time: '2 days ago', read: true, tone: 'danger' },
    { id: 'N-05', dept: 'inventory', title: 'Low stock alert', body: 'Packaging Labels are below the reorder level (320 / 600).', time: '2 days ago', read: true, tone: 'warning' },
  ],
  activities: [
    { id: 'A-01', dept: 'production', text: 'Batch submitted for inspection', detail: 'BAT-SOY-014 · Soya Porridge Flour', time: 'Today, 08:45', tone: 'info' },
    { id: 'A-02', dept: 'inventory', text: 'Materials issued', detail: '1,600 kg Maize to PO-2026-015', time: 'Today, 08:20', tone: 'success' },
    { id: 'A-03', dept: 'quality', text: 'Inspection completed', detail: 'BAT-RIC-013 approved for release', time: 'Yesterday, 16:10', tone: 'success' },
    { id: 'A-04', dept: 'inventory', text: 'Delivery received', detail: '2,200 kg Rice · GRN-2026-089', time: 'Yesterday, 14:35', tone: 'info' },
  ],
  specs: [
    { id: 'SP-01', test: 'Moisture content', product: 'All', min: '10', max: '12.5', unit: '%', method: 'Oven drying' },
    { id: 'SP-02', test: 'Colour & appearance', product: 'All', min: '—', max: '—', unit: 'visual', method: 'Visual comparison' },
    { id: 'SP-03', test: 'Odour', product: 'All', min: '—', max: '—', unit: 'sensory', method: 'Sensory panel' },
    { id: 'SP-04', test: 'Packaging integrity', product: 'All', min: '—', max: '—', unit: 'visual', method: 'Seal inspection' },
  ],
};

type Input = Record<string, any>;

interface StoreApi extends AppState {
  notify: (dept: Dept, title: string, body: string, tone?: AppNotification['tone']) => void;
  createOrder: (v: Input) => string;
  requestMaterial: (v: Input) => string;
  issueMaterial: (id: string, approved: number) => boolean;
  rejectRequest: (id: string) => void;
  createBatch: (v: Input) => string;
  submitBatch: (id: string) => void;
  recordDecision: (id: string, decision: 'Approved' | 'Rejected' | 'On Hold', reason: string, results: Record<string, string>) => void;
  receiveDelivery: (v: Input) => void;
  registerMaterial: (v: Input) => void;
  createNCR: (v: Input) => void;
  updateNCR: (id: string, status: NCR['status']) => void;
  saveSpec: (v: Input) => void;
  updateOrderStatus: (id: string, status: ProductionOrder['status']) => void;
  adjustStock: (materialId: string, delta: number, reason: string) => void;
  recordRawInspection: (v: Input) => void;
  hydrate: (partial: Partial<AppState>) => void;
  addRemoteNotifications: (items: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: (dept: Dept) => void;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(initial);

  const addLog = (dept: Dept, text: string, detail: string, tone: Activity['tone']) =>
    ({ id: uid('A'), dept, text, detail, time: `Today, ${t()}`, tone });

  const notify: StoreApi['notify'] = (dept, title, body, tone = 'info') => {
    setS(p => ({ ...p, notifications: [{ id: uid('N'), dept, title, body, time: t(), read: false, tone }, ...p.notifications] }));
    apiRequest('/api/notifications', { method: 'POST', body: { department: dept, title, body, tone } }).catch(() => {});
  };

  const api: StoreApi = useMemo(() => ({
    ...s,
    hydrate: partial => setS(p => ({ ...p, ...partial })),
    notify,

    createOrder: v => {
      const id = `PO-2026-${String(19 + s.orders.length).padStart(3, '0')}`;
      const order: ProductionOrder = {
        id, productId: v.productId, qty: Number(v.qty), unit: v.unit || 'kg',
        start: v.start, due: v.due, supervisor: v.supervisor, priority: v.priority,
        status: 'Planned', instructions: v.instructions, createdAt: d(),
      };
      setS(p => ({ ...p, orders: [order, ...p.orders], activities: [addLog('production', 'Production order created', `${id} · ${p.products.find(x => x.id === v.productId)?.name}`, 'info'), ...p.activities] }));
      notify('inventory', 'New production order', `${id} has been created for ${v.qty} ${v.unit}.`, 'info');
      return id;
    },

    requestMaterial: v => {
      const id = `MR-2026-${String(25 + s.requests.length).padStart(3, '0')}`;
      const req: MaterialRequest = { id, orderId: v.orderId, materialId: v.materialId, requested: Number(v.qty), approved: 0, issued: 0, status: 'Pending', requester: v.requester || 'Production', date: d() };
      setS(p => ({ ...p, requests: [req, ...p.requests], activities: [addLog('production', 'Material requested', `${id} · ${p.materials.find(x => x.id === v.materialId)?.name}`, 'warning'), ...p.activities] }));
      notify('inventory', 'Material request', `Production requested ${v.qty} ${s.materials.find(x => x.id === v.materialId)?.unit || ''} of ${s.materials.find(x => x.id === v.materialId)?.name}.`, 'warning');
      return id;
    },

    issueMaterial: (id, approved) => {
      const req = s.requests.find(r => r.id === id);
      if (!req) return false;
      const mat = s.materials.find(m => m.id === req.materialId);
      if (!mat) return false;
      const qty = Math.min(Number(approved), req.requested, mat.qty);
      if (qty <= 0) return false;
      setS(p => ({
        ...p,
        requests: p.requests.map(r => r.id === id ? { ...r, approved: qty, issued: qty, status: qty < r.requested ? 'Partial' : 'Issued' } : r),
        materials: p.materials.map(m => m.id === req.materialId ? { ...m, qty: m.qty - qty } : m),
        movements: [{ id: uid('MOV'), materialId: req.materialId, type: 'Issue' as const, qty, ref: id, date: d(), by: 'Alice Wambui' }, ...p.movements],
        activities: [addLog('inventory', 'Materials issued', `${qty} ${mat.unit} ${mat.name} · ${id}`, 'success'), ...p.activities],
      }));
      notify('production', 'Materials issued', `${qty} ${mat.unit} of ${mat.name} issued for ${req.orderId}.`, 'success');
      return true;
    },

    rejectRequest: id => {
      setS(p => ({ ...p, requests: p.requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r) }));
      notify('production', 'Request rejected', `${id} was rejected by Inventory. Review and resubmit.`, 'danger');
    },

    createBatch: v => {
      const flavor = s.products.find(x => x.id === v.productId)?.flavor?.slice(0, 3).toUpperCase() || 'BAT';
      const id = `BAT-${flavor}-${String(10 + s.batches.length).padStart(3, '0')}`;
      const consumed: Record<string, number> = {};
      (v.consumed || []).forEach((c: any) => { if (c.materialId && c.qty) consumed[c.materialId] = Number(c.qty); });
      const batch: Batch = { id, orderId: v.orderId, productId: v.productId, produced: Number(v.produced), bags: Number(v.bags), consumed, wastage: Number(v.wastage || 0), supervisor: v.supervisor, date: d(), status: 'Draft' };
      setS(p => ({ ...p, batches: [batch, ...p.batches], activities: [addLog('production', 'Batch created', `${id} · ${v.produced} kg produced`, 'info'), ...p.activities] }));
      return id;
    },

    submitBatch: id => {
      setS(p => ({ ...p, batches: p.batches.map(b => b.id === id ? { ...b, status: 'In Inspection' } : b), activities: [addLog('production', 'Batch submitted to Quality', `${id} is awaiting inspection`, 'warning'), ...p.activities] }));
      notify('quality', 'New inspection request', `Production batch ${id} has been submitted for quality inspection.`, 'info');
    },

    recordDecision: (id, decision, reason, results) => {
      const batch = s.batches.find(b => b.id === id);
      if (!batch) return;
      const prod = s.products.find(p => p.id === batch.productId);
      const status = decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : 'On Hold';
      setS(p => {
        const next: Partial<AppState> = {
          batches: p.batches.map(b => b.id === id ? { ...b, status } : b),
          inspections: [{ id: uid('INSP'), batchId: id, productId: batch.productId, inspector: 'Grace Akinyi', date: d(), results, decision: decision === 'Approved' ? 'Pass' : decision === 'Rejected' ? 'Fail' : 'Hold', comments: reason }, ...p.inspections],
          decisions: [{ id: uid('DEC'), batchId: id, decision, reason, by: 'Grace Akinyi', date: d() }, ...p.decisions],
          activities: [addLog('quality', `Batch ${decision.toLowerCase()}`, `${id} · ${reason}`, decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'danger' : 'warning'), ...p.activities],
        };
        if (decision === 'Approved') {
          next.finished = [{ id: uid('FG'), productId: batch.productId, batchId: id, qty: batch.bags, date: d(), location: 'Finished goods · Rack 2' }, ...p.finished];
          next.movements = [{ id: uid('MOV'), productId: batch.productId, type: 'Finished Goods' as const, qty: batch.bags, ref: id, date: d(), by: 'Alice Wambui' }, ...p.movements];
        } else {
          next.ncrs = [{ id: uid('NCR'), batchId: id, description: reason, category: 'Product quality', severity: decision === 'Rejected' ? 'High' : 'Medium', status: 'Open', owner: 'Production', date: d(), due: d(3) }, ...p.ncrs];
        }
        return { ...p, ...next } as AppState;
      });
      notify('production', decision === 'Approved' ? 'Batch approved' : decision === 'Rejected' ? 'Batch rejected' : 'Batch on hold', `${id}: ${reason}`, decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'danger' : 'warning');
      notify('inventory', decision === 'Approved' ? 'Finished goods released' : 'Batch not released', decision === 'Approved'
        ? `${id} · ${batch.bags} bags of ${prod?.name} added to saleable stock.`
        : `${id} must remain on hold and must not enter saleable stock.`, decision === 'Approved' ? 'success' : 'warning');
    },

    receiveDelivery: v => {
      const id = `GRN-2026-${String(90 + s.movements.length).padStart(3, '0')}`;
      setS(p => ({
        ...p,
        materials: p.materials.map(m => m.id === v.materialId ? { ...m, qty: m.qty + Number(v.qty) } : m),
        movements: [{ id: uid('MOV'), materialId: v.materialId, type: 'Receipt' as const, qty: Number(v.qty), ref: id, date: d(), by: v.receivedBy || 'Alice Wambui' }, ...p.movements],
        activities: [addLog('inventory', 'Delivery received', `${v.qty} ${s.materials.find(x => x.id === v.materialId)?.unit} · ${id}`, 'success'), ...p.activities],
      }));
      notify('quality', 'Raw material inspection', `Delivery ${id} received. Please record an incoming inspection.`, 'info');
    },

    registerMaterial: v => {
      setS(p => ({ ...p, materials: [{ id: v.id || uid('RM'), name: v.name, category: v.category, unit: v.unit, qty: Number(v.qty || 0), reorder: Number(v.reorder || 0), image: IMG.grain, location: v.location || 'Warehouse A', supplier: v.supplier || '—', expiry: v.expiry }, ...p.materials] }));
      notify('quality', 'New material registered', `${v.name} is available for incoming inspection.`, 'info');
    },

    createNCR: v => {
      setS(p => ({ ...p, ncrs: [{ id: uid('NCR'), batchId: v.batchId, description: v.description, category: v.category, severity: v.severity, status: 'Open', owner: v.owner, date: d(), due: v.due || d(3) }, ...p.ncrs] }));
      notify('production', 'Non-conformance raised', `NCR opened for ${v.batchId}. Corrective action required.`, 'warning');
    },

    updateNCR: (id, status) => setS(p => ({ ...p, ncrs: p.ncrs.map(n => n.id === id ? { ...n, status } : n) })),

    saveSpec: v => setS(p => {
      const exists = p.specs.some(x => x.id === v.id);
      return { ...p, specs: exists ? p.specs.map(x => x.id === v.id ? { ...x, ...v } as QualitySpec : x) : [...p.specs, { ...v, id: uid('SP') } as QualitySpec] };
    }),

    updateOrderStatus: (id, status) => {
      setS(p => ({ ...p, orders: p.orders.map(o => o.id === id ? { ...o, status } : o), activities: [addLog('production', `Order ${status.toLowerCase()}`, id, status === 'Completed' ? 'success' : 'info'), ...p.activities] }));
      if (status === 'Completed') notify('inventory', 'Order completed', `${id} has finished production and batches are ready for inspection.`, 'info');
    },

    adjustStock: (materialId, delta, reason) => {
      setS(p => ({
        ...p,
        materials: p.materials.map(m => m.id === materialId ? { ...m, qty: Math.max(0, m.qty + delta) } : m),
        movements: [{ id: uid('MOV'), materialId, type: 'Adjustment' as const, qty: delta, ref: reason, date: d(), by: 'Alice Wambui' }, ...p.movements],
        activities: [addLog('inventory', 'Stock adjusted', `${materialId} · ${delta > 0 ? '+' : ''}${delta} · ${reason}`, 'warning'), ...p.activities],
      }));
    },

    recordRawInspection: v => {
      setS(p => ({ ...p, activities: [addLog('quality', 'Raw material inspected', `${v.materialId} · ${v.decision} · ${v.reference || ''}`, v.decision === 'Rejected' ? 'danger' : 'success'), ...p.activities] }));
      notify('inventory', 'Raw material inspection recorded', `${v.materialId}: ${v.decision}. ${v.remarks || ''}`, v.decision === 'Rejected' ? 'danger' : 'success');
    },

    addRemoteNotifications: items => setS(p => {
      const known = new Set(p.notifications.map(n => n.id));
      const fresh = items.filter(n => !known.has(n.id));
      return fresh.length ? { ...p, notifications: [...fresh, ...p.notifications] } : p;
    }),

    markRead: id => {
      setS(p => ({ ...p, notifications: p.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
      apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    },
    markAllRead: dept => {
      setS(p => ({ ...p, notifications: p.notifications.map(n => n.dept === dept ? { ...n, read: true } : n) }));
      apiRequest(`/api/notifications/read-all?department=${dept}`, { method: 'PATCH' }).catch(() => {});
    },
  }), [s]);

  const hydrate: StoreApi['hydrate'] = partial => setS(p => ({ ...p, ...partial }));

  const refresh = useCallback(async () => {
    const kinds = ['products', 'materials', 'orders', 'batches', 'requests', 'movements', 'inspections', 'decisions', 'ncrs', 'finished', 'specs'];
    const results = await Promise.all(kinds.map(k => recordApi.list(k).catch(() => null)));
    const next: Partial<AppState> = {};
    kinds.forEach((k, i) => {
      const data = results[i];
      if (Array.isArray(data) && data.length) (next as any)[k] = data;
    });
    if (Object.keys(next).length) setS(p => ({ ...p, ...next }));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const persist: Record<string, (...args: any[]) => Promise<any>> = {
    createOrder: v => apiRequest('/api/records/orders', { method: 'POST', body: v }),
    requestMaterial: v => apiRequest('/api/records/requests', { method: 'POST', body: v }),
    issueMaterial: (id, qty) => apiRequest('/api/workflow/issue', { method: 'POST', body: { requestId: id, qty } }),
    rejectRequest: id => apiRequest(`/api/records/requests/${id}`, { method: 'PUT', body: { status: 'Rejected' } }),
    createBatch: v => apiRequest('/api/records/batches', { method: 'POST', body: v }),
    submitBatch: id => apiRequest(`/api/records/batches/${id}`, { method: 'PUT', body: { status: 'In Inspection' } }),
    recordDecision: (id, decision, reason, results) => apiRequest('/api/workflow/decision', { method: 'POST', body: { batchId: id, decision, reason, results } }),
    receiveDelivery: v => apiRequest('/api/workflow/delivery', { method: 'POST', body: { materialId: v.materialId, qty: v.qty, supplier: v.supplier } }),
    registerMaterial: v => apiRequest('/api/records/materials', { method: 'POST', body: v }),
    createNCR: v => apiRequest('/api/records/ncrs', { method: 'POST', body: v }),
    updateNCR: (id, status) => apiRequest(`/api/records/ncrs/${id}`, { method: 'PUT', body: { status } }),
    saveSpec: v => apiRequest('/api/records/specs', { method: 'POST', body: v }),
    updateOrderStatus: (id, status) => apiRequest(`/api/records/orders/${id}`, { method: 'PUT', body: { status } }),
    adjustStock: async (id, delta, reason) => {
      const mat: any = await apiRequest(`/api/records/materials/${id}`);
      await apiRequest(`/api/records/materials/${id}`, { method: 'PUT', body: { qty: Math.max(0, mat.qty + delta) } });
      await apiRequest('/api/records/movements', { method: 'POST', body: { materialId: id, type: 'Adjustment', qty: delta, ref: reason } });
    },
    recordRawInspection: v => apiRequest('/api/records/inspections', { method: 'POST', body: v }),
  };

  const liveApi: StoreApi = useMemo(() => new Proxy(api, {
    get(target, prop) {
      const value = (target as any)[prop];
      if (typeof value === 'function' && !['notify', 'markRead', 'markAllRead', 'hydrate', 'addRemoteNotifications'].includes(String(prop))) {
        return (...args: any[]) => {
          const result = value(...args);
          const task = persist[String(prop)] ? persist[String(prop)](...args) : Promise.resolve();
          task.catch(() => {}).finally(() => { void refresh(); });
          return result;
        };
      }
      return value;
    },
  }) as StoreApi, [api, refresh]);

  return <Ctx.Provider value={liveApi}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside StoreProvider');
  return ctx;
}

export const labelOf = (s: AppState, productId: string) => s.products.find(p => p.id === productId)?.name || productId;
export const materialOf = (s: AppState, materialId: string) => s.materials.find(m => m.id === materialId);
export const flavorOf = (s: AppState, productId: string): Flavor => s.products.find(p => p.id === productId)?.flavor || 'Maize';
