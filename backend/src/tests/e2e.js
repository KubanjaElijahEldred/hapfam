/* End-to-end verification of the HAPFAM integrated workflow. Run: node src/tests/e2e.js */
const BASE = process.env.API_URL || 'http://127.0.0.1:4000';
const PASS = process.env.SEED_PASSWORD || 'Hapfam@2026Secure';
let passed = 0, failed = 0;
function check(name, condition, extra = '') {
  if (condition) { passed++; console.log('  PASS  ' + name); }
  else { failed++; console.log('  FAIL  ' + name + (extra ? ' :: ' + extra : '')); }
}
async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

(async () => {
  console.log('\n== HAPFAM end-to-end verification ==');
  let r = await call('/api/health');
  check('health + database connected', r.status === 200 && r.data.db === 1);

  r = await call('/api/auth/login', { method: 'POST', body: { email: 'manager@hapfam.co.ug', password: 'short' } });
  check('weak password rejected', r.status === 401);

  const login = async (email) => (await call('/api/auth/login', { method: 'POST', body: { email, password: PASS } })).data.token;
  const manager = await login('manager@hapfam.co.ug');
  const prod = await login('production@hapfam.co.ug');
  const inv = await login('inventory@hapfam.co.ug');
  const qa = await login('quality@hapfam.co.ug');
  check('all four roles authenticated', !!(manager && prod && inv && qa));

  r = await call('/api/auth/register', { method: 'POST', token: manager, body: { name: 'Test', email: 'weak@hapfam.co.ug', password: 'short', role: 'Production Manager', department: 'production' } });
  check('manager cannot register weak password', r.status === 400);
  r = await call('/api/auth/register', { method: 'POST', token: prod, body: { name: 'Test', email: 'x@hapfam.co.ug', password: PASS, role: 'Manager', department: 'management' } });
  check('non-manager cannot register users', r.status === 403);

  console.log('\n-- Announcements: manager -> all departments, departments reply --');
  r = await call('/api/announcements', { method: 'POST', token: manager, body: { title: 'Line maintenance tomorrow', body: 'Production line B will be serviced. Plan accordingly.', audience: 'all', priority: 'high' } });
  check('manager created announcement', r.status === 201, JSON.stringify(r.data));
  const annId = r.data.id;
  for (const [dept, token] of [['production', prod], ['inventory', inv], ['quality', qa]]) {
    const a = await call('/api/announcements', { token });
    check(`${dept} received announcement`, a.data.some(x => x.id === annId));
    const n = await call('/api/notifications', { token });
    check(`${dept} got announcement notification`, n.data.some(x => x.ref_id === annId));
  }
  r = await call(`/api/announcements/${annId}/replies`, { method: 'POST', token: inv, body: { body: 'Inventory will pre-stage packaging materials.' } });
  check('inventory replied', r.status === 201);
  r = await call(`/api/announcements/${annId}/replies`, { method: 'POST', token: qa, body: { body: 'Quality will complete pending tests before the shutdown.' } });
  check('quality replied', r.status === 201);
  r = await call('/api/announcements', { token: manager });
  const ann = r.data.find(x => x.id === annId);
  check('manager sees announcement origin', ann && ann.author_department === 'management');
  check('manager sees replies with source departments', ann && ann.replies.length === 2 && ann.replies.every(x => ['inventory', 'quality'].includes(x.department)), JSON.stringify(ann?.replies));
  r = await call('/api/notifications', { token: manager });
  check('manager notified about replies', r.data.some(x => x.title.includes('Reply from')));

  console.log('\n-- Stores -> Production: material issue --');
  r = await call('/api/workflow/issue', { method: 'POST', token: inv, body: { requestId: 'MR-DEMO-001', qty: 600 } });
  check('inventory issued 600 kg', r.status === 200 && r.data.issued === 600, JSON.stringify(r.data));
  check('stock deducted exactly', Math.round(r.data.remaining) === 8550);
  r = await call('/api/workflow/issue', { method: 'POST', token: inv, body: { requestId: 'MR-DEMO-001', qty: 600 } });
  check('duplicate issue blocked', r.status === 409);
  r = await call('/api/notifications', { token: prod });
  check('production notified of issue', r.data.some(x => x.title === 'Materials issued'));
  r = await call('/api/records/movements', { token: inv });
  check('issue movement recorded', r.data.some(x => x.ref === 'MR-DEMO-001'));

  console.log('\n-- Quality decision -> finished goods --');
  r = await call('/api/workflow/decision', { method: 'POST', token: qa, body: { batchId: 'BAT-DEMO-001', decision: 'Approved', reason: 'All tests within configured specification', results: { Moisture: '11.6%' } } });
  check('quality approved batch', r.status === 200);
  r = await call('/api/records/finished', { token: inv });
  check('finished goods increased', r.data.some(x => x.batchId === 'BAT-DEMO-001' && x.qty === 290));
  r = await call('/api/notifications', { token: inv });
  check('inventory notified of release', r.data.some(x => x.title === 'Finished goods released'));

  r = await call('/api/workflow/decision', { method: 'POST', token: qa, body: { batchId: 'BAT-DEMO-001', decision: 'Rejected', reason: 'Repeat decision attempt' } });
  const finishedAfter = await call('/api/records/finished', { token: inv });
  check('duplicate decision did not add extra stock', finishedAfter.data.filter(x => x.batchId === 'BAT-DEMO-001').length === 1);
  r = await call('/api/workflow/decision', { method: 'POST', token: qa, body: { batchId: 'BAT-DEMO-001', decision: 'Rejected', reason: '', results: {} } });
  check('decision requires reason', r.status === 400);

  console.log('\n-- Rejection must not enter saleable stock --');
  const rid = 'BAT-REJECT-' + Date.now();
  await call('/api/records/batches', { method: 'POST', token: prod, body: { id: rid, productId: 'PRD-SOY', bags: 100, status: 'In Inspection' } });
  r = await call('/api/workflow/decision', { method: 'POST', token: qa, body: { batchId: rid, decision: 'Rejected', reason: 'Off-spec colour', results: { Colour: 'Fail' } } });
  check('quality rejected batch', r.status === 200);
  const fin2 = await call('/api/records/finished', { token: inv });
  check('rejected batch NOT in finished stock', !fin2.data.some(x => x.batchId === rid));
  const ncrs = await call('/api/records/ncrs', { token: qa });
  check('non-conformance created for rejection', ncrs.data.some(x => x.batchId === rid));

  console.log('\n-- CRUD in every department --');
  for (const [dept, token] of [['production', prod], ['inventory', inv], ['quality', qa]]) {
    const id = `T-${dept.toUpperCase()}-${Date.now()}`;
    r = await call('/api/records/notes', { method: 'POST', token, body: { id, department: dept, text: 'CRUD verification' } });
    check(`${dept} create`, r.status === 201);
    r = await call(`/api/records/notes/${id}`, { method: 'PUT', token, body: { text: 'updated' } });
    check(`${dept} update`, r.status === 200 && r.data.text === 'updated');
    r = await call('/api/records/notes', { token });
    check(`${dept} read`, r.data.some(x => x.id === id));
    r = await call(`/api/records/notes/${id}`, { method: 'DELETE', token });
    check(`${dept} delete`, r.status === 200);
  }

  r = await call('/api/audit', { token: manager });
  check('manager sees audit trail', r.status === 200 && r.data.length > 0);
  r = await call('/api/audit', { token: prod });
  check('non-manager cannot see audit trail', r.status === 403);

  console.log(`\nRESULT: ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
