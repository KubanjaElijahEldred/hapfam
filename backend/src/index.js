require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');
const { strongPassword, sign, requireAuth, requireManager, audit, MIN_PASSWORD_LENGTH } = require('./auth');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));

const DEPARTMENTS = ['production', 'inventory', 'quality'];
const uid = (p) => `${p}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

/* ------------------------------- health/auth ------------------------------- */
app.get('/api/health', async (_req, res) => {
  try { const r = await pool.query('SELECT 1 AS ok'); res.json({ ok: true, db: r.rows[0].ok, service: 'hapfam-mmis-api' }); }
  catch (e) { res.status(503).json({ ok: false, error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
  await audit(user.name, 'login', 'auth', user.email);
  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

app.post('/api/auth/register', requireAuth, requireManager, async (req, res) => {
  const { name, email, password, role, department } = req.body || {};
  if (!name || !email || !role || !department) return res.status(400).json({ error: 'name, email, role and department are required' });
  if (!strongPassword(password)) return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters with upper, lower, number and symbol` });
  try {
    const id = uid('USR');
    await pool.query('INSERT INTO users (id,name,email,password_hash,role,department) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, name, email, await bcrypt.hash(password, 12), role, department]);
    await audit(req.user.name, 'register', 'user', email);
    res.status(201).json({ id, name, email, role, department });
  } catch (e) { res.status(409).json({ error: 'Email already exists' }); }
});

app.get('/api/me', requireAuth, (req, res) => res.json(req.user));

/* --------------------------- generic departmental CRUD --------------------------- */
async function getRecord(kind, id) {
  const r = await pool.query('SELECT data FROM records WHERE kind=$1 AND id=$2', [kind, id]);
  return r.rows[0]?.data || null;
}
async function putRecord(kind, id, data, department, actor) {
  await pool.query(`INSERT INTO records (kind,id,department,data,created_by,updated_at)
    VALUES ($1,$2,$3,$4::jsonb,$5,NOW())
    ON CONFLICT (kind,id) DO UPDATE SET data=$4::jsonb, department=$3, updated_at=NOW()`,
    [kind, id, department, JSON.stringify(data), actor]);
}

app.get('/api/records/:kind', requireAuth, async (req, res) => {
  const params = [req.params.kind];
  let sql = 'SELECT data FROM records WHERE kind=$1';
  if (req.query.department) { params.push(req.query.department); sql += ' AND department=$2'; }
  sql += ' ORDER BY updated_at DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows.map(r => r.data));
});

app.get('/api/records/:kind/:id', requireAuth, async (req, res) => {
  const data = await getRecord(req.params.kind, req.params.id);
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

app.post('/api/records/:kind', requireAuth, async (req, res) => {
  const data = { ...req.body, id: req.body.id || uid(req.params.kind.slice(0, 3).toUpperCase()) };
  const department = data.department || req.user.department;
  await putRecord(req.params.kind, data.id, data, department, req.user.name);
  await audit(req.user.name, 'create', req.params.kind, data.id);
  res.status(201).json(data);
});

app.put('/api/records/:kind/:id', requireAuth, async (req, res) => {
  const existing = await getRecord(req.params.kind, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const data = { ...existing, ...req.body, id: req.params.id };
  await putRecord(req.params.kind, req.params.id, data, data.department || req.user.department, req.user.name);
  await audit(req.user.name, 'update', req.params.kind, req.params.id);
  res.json(data);
});

app.delete('/api/records/:kind/:id', requireAuth, async (req, res) => {
  const r = await pool.query('DELETE FROM records WHERE kind=$1 AND id=$2', [req.params.kind, req.params.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
  await audit(req.user.name, 'delete', req.params.kind, req.params.id);
  res.json({ deleted: true });
});

/* --------------------------- workflow transactions --------------------------- */
async function notify(department, title, body, tone = 'info', refId = null) {
  await pool.query('INSERT INTO notifications (id,department,title,body,tone,ref_id) VALUES ($1,$2,$3,$4,$5,$6)',
    [uid('NOT'), department, title, body, tone, refId]);
}

app.post('/api/workflow/issue', requireAuth, async (req, res) => {
  const { requestId, qty } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqR = await client.query('SELECT data FROM records WHERE kind=$1 AND id=$2', ['requests', requestId]);
    const request = reqR.rows[0]?.data;
    if (!request) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Request not found' }); }
    if (request.status === 'Issued' || request.status === 'Partial') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Request already issued' }); }
    const matR = await client.query('SELECT data FROM records WHERE kind=$1 AND id=$2', ['materials', request.materialId]);
    const material = matR.rows[0]?.data;
    if (!material) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Material not found' }); }
    const amount = Math.min(Number(qty), Number(request.requested), Number(material.qty));
    if (amount <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'No available stock to issue' }); }
    const updated = { ...request, approved: amount, issued: amount, status: amount < request.requested ? 'Partial' : 'Issued' };
    const newMat = { ...material, qty: Number(material.qty) - amount };
    await client.query('UPDATE records SET data=$1::jsonb, updated_at=NOW() WHERE kind=$2 AND id=$3', [JSON.stringify(updated), 'requests', requestId]);
    await client.query('UPDATE records SET data=$1::jsonb, updated_at=NOW() WHERE kind=$2 AND id=$3', [JSON.stringify(newMat), 'materials', material.id]);
    const movementId = uid('MOV');
    await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
      ['movements', movementId, 'inventory', JSON.stringify({ id: movementId, materialId: material.id, type: 'Issue', qty: amount, ref: requestId, by: req.user.name }), req.user.name]);
    await notify('production', 'Materials issued', `${amount} ${material.unit} of ${material.name} issued for ${request.orderId}.`, 'success', requestId);
    await client.query('COMMIT');
    await audit(req.user.name, 'issue', 'request', requestId);
    res.json({ issued: amount, remaining: newMat.qty, request: updated });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

app.post('/api/workflow/decision', requireAuth, async (req, res) => {
  const { batchId, decision, reason, results } = req.body || {};
  if (!['Approved', 'Rejected', 'On Hold'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
  if (!reason) return res.status(400).json({ error: 'Reason is required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bR = await client.query('SELECT data FROM records WHERE kind=$1 AND id=$2', ['batches', batchId]);
    const batch = bR.rows[0]?.data;
    if (!batch) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Batch not found' }); }
    await client.query('UPDATE records SET data=$1::jsonb, updated_at=NOW() WHERE kind=$2 AND id=$3',
      [JSON.stringify({ ...batch, status: decision }), 'batches', batchId]);
    const inspId = uid('INSP');
    await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
      ['inspections', inspId, 'quality', JSON.stringify({ id: inspId, batchId, productId: batch.productId, inspector: req.user.name, results: results || {}, decision: decision === 'Approved' ? 'Pass' : decision === 'Rejected' ? 'Fail' : 'Hold', comments: reason }), req.user.name]);
    const decId = uid('DEC');
    await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
      ['decisions', decId, 'quality', JSON.stringify({ id: decId, batchId, decision, reason, by: req.user.name }), req.user.name]);
    if (decision === 'Approved') {
      const fgId = uid('FG');
      await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
        ['finished', fgId, 'inventory', JSON.stringify({ id: fgId, productId: batch.productId, batchId, qty: batch.bags, by: req.user.name }), req.user.name]);
      await notify('inventory', 'Finished goods released', `${batchId} · ${batch.bags} bags added to saleable stock.`, 'success', batchId);
    } else {
      const ncrId = uid('NCR');
      await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
        ['ncrs', ncrId, 'quality', JSON.stringify({ id: ncrId, batchId, description: reason, severity: decision === 'Rejected' ? 'High' : 'Medium', status: 'Open', owner: 'Production' }), req.user.name]);
      await notify('inventory', 'Batch not released', `${batchId} must remain on hold and must not enter saleable stock.`, 'warning', batchId);
    }
    await notify('production', `Batch ${decision.toLowerCase()}`, `${batchId}: ${reason}`, decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'danger' : 'warning', batchId);
    await client.query('COMMIT');
    await audit(req.user.name, 'decision', 'batch', `${batchId} ${decision}`);
    res.json({ batchId, decision });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

app.post('/api/workflow/delivery', requireAuth, async (req, res) => {
  const { materialId, qty, supplier } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const mR = await client.query('SELECT data FROM records WHERE kind=$1 AND id=$2', ['materials', materialId]);
    const material = mR.rows[0]?.data;
    if (!material) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Material not found' }); }
    const updated = { ...material, qty: Number(material.qty) + Number(qty), supplier: supplier || material.supplier };
    await client.query('UPDATE records SET data=$1::jsonb, updated_at=NOW() WHERE kind=$2 AND id=$3', [JSON.stringify(updated), 'materials', materialId]);
    await client.query(`INSERT INTO records (kind,id,department,data,created_by) VALUES ($1,$2,$3,$4::jsonb,$5)`,
      ['movements', uid('MOV'), 'inventory', JSON.stringify({ materialId, type: 'Receipt', qty: Number(qty), supplier, by: req.user.name }), req.user.name]);
    await notify('quality', 'Raw material inspection', `Delivery received: ${qty} ${material.unit} of ${material.name}. Please inspect.`, 'info');
    await client.query('COMMIT');
    await audit(req.user.name, 'delivery', 'material', materialId);
    res.json({ material: updated });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
  finally { client.release(); }
});

/* ------------------------------- announcements ------------------------------- */
app.get('/api/announcements', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  const replies = await pool.query('SELECT * FROM announcement_replies ORDER BY created_at ASC');
  const byAnn = {};
  replies.rows.forEach(r => { (byAnn[r.announcement_id] ||= []).push(r); });
  const visible = req.user.role === 'Manager' ? rows : rows.filter(a => a.audience === 'all' || a.audience === req.user.department);
  res.json(visible.map(a => ({ ...a, replies: req.user.role === 'Manager' ? (byAnn[a.id] || []) : [] })));
});

app.post('/api/announcements', requireAuth, requireManager, async (req, res) => {
  const { title, body, audience = 'all', priority = 'normal' } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const id = uid('ANN');
  await pool.query(`INSERT INTO announcements (id,author_id,author_name,author_department,audience,title,body,priority)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id, req.user.id, req.user.name, 'management', audience, title, body, priority]);
  const targets = audience === 'all' ? DEPARTMENTS : [audience];
  for (const dept of targets) await notify(dept, 'New announcement', `${title} — from Management`, priority === 'high' ? 'warning' : 'info', id);
  await audit(req.user.name, 'announce', 'announcement', id);
  res.status(201).json({ id, title, body, audience, priority, author_department: 'management', author_name: req.user.name, replies: [] });
});

app.post('/api/announcements/:id/replies', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Reply body is required' });
  const ann = await pool.query('SELECT id FROM announcements WHERE id=$1', [req.params.id]);
  if (!ann.rowCount) return res.status(404).json({ error: 'Announcement not found' });
  const id = uid('REP');
  const department = req.user.department;
  await pool.query('INSERT INTO announcement_replies (id,announcement_id,department,author_name,body) VALUES ($1,$2,$3,$4,$5)',
    [id, req.params.id, department, req.user.name, body]);
  await notify('management', `Reply from ${department}`, `${req.user.name}: ${body.slice(0, 90)}`, 'info', req.params.id);
  await audit(req.user.name, 'reply', 'announcement', req.params.id);
  res.status(201).json({ id, announcement_id: req.params.id, department, author_name: req.user.name, body });
});

app.delete('/api/announcements/:id', requireAuth, requireManager, async (req, res) => {
  const r = await pool.query('DELETE FROM announcements WHERE id=$1', [req.params.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
  await audit(req.user.name, 'delete', 'announcement', req.params.id);
  res.json({ deleted: true });
});

/* -------------------------------- notifications -------------------------------- */
app.post('/api/notifications', requireAuth, async (req, res) => {
  const { department, title, body, tone = 'info', ref_id = null } = req.body || {};
  if (!department || !title || !body) return res.status(400).json({ error: 'department, title and body are required' });
  const id = uid('NOT');
  await pool.query('INSERT INTO notifications (id,department,title,body,tone,ref_id) VALUES ($1,$2,$3,$4,$5,$6)', [id, department, title, body, tone, ref_id]);
  res.status(201).json({ id });
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  const target = req.user.role === 'Manager' ? req.query.department || 'management' : req.user.department;
  const { rows } = await pool.query('SELECT * FROM notifications WHERE department=$1 ORDER BY created_at DESC LIMIT 100', [target]);
  res.json(rows);
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  await pool.query('UPDATE notifications SET read=TRUE WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
  const dept = req.user.role === 'Manager' ? (req.query.department || 'management') : req.user.department;
  await pool.query('UPDATE notifications SET read=TRUE WHERE department=$1', [dept]);
  res.json({ ok: true });
});

app.get('/api/audit', requireAuth, requireManager, async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });

const PORT = process.env.PORT || 4000;
initDb().then(() => app.listen(PORT, () => console.log(`HAPFAM API listening on :${PORT}`)))
  .catch(e => { console.error('DB init failed', e); process.exit(1); });
