const { app, initDb } = require('../src/app');
let ready;
module.exports = async (req, res) => {
  if (!ready) ready = initDb().catch(() => null);
  await ready;
  return app(req, res);
};
