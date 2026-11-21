const { app, initDb } = require('./app');
const PORT = process.env.PORT || 4000;
initDb().then(() => app.listen(PORT, () => console.log(`HAPFAM API listening on :${PORT}`)))
  .catch(e => { console.error('DB init failed', e); process.exit(1); });
