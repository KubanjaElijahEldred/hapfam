require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');

const PASSWORD = process.env.SEED_PASSWORD || 'Hapfam@2026Secure';

const USERS = [
  ['USR-MGR', 'Elijah Kubanja', 'manager@hapfam.co.ug', 'Manager', 'management'],
  ['USR-PRD', 'Daniel Ochieng', 'production@hapfam.co.ug', 'Production Manager', 'production'],
  ['USR-INV', 'Alice Wambui', 'inventory@hapfam.co.ug', 'Store Keeper', 'inventory'],
  ['USR-QA', 'Grace Akinyi', 'quality@hapfam.co.ug', 'Quality Officer', 'quality'],
];

const RECORDS = [
  ['materials', 'RM-MAI', 'inventory', { id: 'RM-MAI', name: 'Maize', category: 'Raw Material', unit: 'kg', qty: 9150, reorder: 2500, location: 'Warehouse B' }],
  ['materials', 'RM-SOY', 'inventory', { id: 'RM-SOY', name: 'Soya Beans', category: 'Raw Material', unit: 'kg', qty: 4820, reorder: 1500, location: 'Warehouse A' }],
  ['materials', 'RM-RIC', 'inventory', { id: 'RM-RIC', name: 'Rice', category: 'Raw Material', unit: 'kg', qty: 6340, reorder: 2000, location: 'Warehouse A' }],
  ['materials', 'PM-BAG', 'inventory', { id: 'PM-BAG', name: 'Packaging Bags', category: 'Packaging', unit: 'pcs', qty: 740, reorder: 500, location: 'Warehouse C' }],
  ['products', 'PRD-MAI', 'production', { id: 'PRD-MAI', name: 'Maize Porridge Flour', flavor: 'Maize' }],
  ['products', 'PRD-SOY', 'production', { id: 'PRD-SOY', name: 'Soya Porridge Flour', flavor: 'Soya' }],
  ['products', 'PRD-RIC', 'production', { id: 'PRD-RIC', name: 'Rice Porridge Flour', flavor: 'Rice' }],
  ['orders', 'PO-DEMO-001', 'production', { id: 'PO-DEMO-001', productId: 'PRD-MAI', qty: 2000, unit: 'kg', status: 'Planned', supervisor: 'Daniel Ochieng' }],
  ['requests', 'MR-DEMO-001', 'production', { id: 'MR-DEMO-001', orderId: 'PO-DEMO-001', materialId: 'RM-MAI', requested: 600, approved: 0, issued: 0, status: 'Pending' }],
  ['batches', 'BAT-DEMO-001', 'production', { id: 'BAT-DEMO-001', orderId: 'PO-DEMO-001', productId: 'PRD-MAI', produced: 580, bags: 290, status: 'In Inspection' }],
];

(async () => {
  await initDb();
  const hash = await bcrypt.hash(PASSWORD, 12);
  for (const [id, name, email, role, department] of USERS) {
    await pool.query(`INSERT INTO users (id,name,email,password_hash,role,department) VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (email) DO UPDATE SET password_hash=$4, role=$5, department=$6`, [id, name, email, hash, role, department]);
  }
  for (const [kind, id, dept, data] of RECORDS) {
    await pool.query(`INSERT INTO records (kind,id,department,data) VALUES ($1,$2,$3,$4::jsonb)
      ON CONFLICT (kind,id) DO UPDATE SET data=$4::jsonb`, [kind, id, dept, JSON.stringify(data)]);
  }
  console.log('Seed complete. Demo password:', PASSWORD, `(${PASSWORD.length} characters)`);
  await pool.end();
})().catch(async e => { console.error(e); await pool.end(); process.exit(1); });
