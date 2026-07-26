// MINIMAL TEST - does Vercel routing work at all?
module.exports = (req, res) => {
  try {
    // Test 1: Basic response works
    const info = {
      status: 'Vercel function is working!',
      path: req.url,
      method: req.method,
      node: process.version,
      env: process.env.NODE_ENV || 'not set',
    };

    // Test 2: Try loading server.js
    try {
      const app = require('../server.js');
      info.serverLoaded = true;
      // If server loaded OK, use it to handle the request
      return app(req, res);
    } catch (loadErr) {
      info.serverLoaded = false;
      info.serverError = loadErr.message;
      info.serverStack = loadErr.stack;
    }

    res.status(500).json(info);
  } catch (err) {
    res.status(500).json({ fatal: err.message });
  }
};
