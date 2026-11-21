const jwt = require('jsonwebtoken');
const { pool } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'hapfam-dev-secret-change-in-production';
const MIN_PASSWORD_LENGTH = 12;

function strongPassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH &&
    /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, department: user.department, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireManager(req, res, next) {
  if (!req.user || req.user.role !== 'Manager') return res.status(403).json({ error: 'Manager access required' });
  next();
}

async function audit(actor, action, entity, details) {
  await pool.query(
    'INSERT INTO audit_logs (id, actor, action, entity, details) VALUES ($1,$2,$3,$4,$5)',
    [`AUD-${Date.now()}-${Math.floor(Math.random()*1000)}`, actor, action, entity, details || null]
  );
}

module.exports = { JWT_SECRET, MIN_PASSWORD_LENGTH, strongPassword, sign, requireAuth, requireManager, audit };
