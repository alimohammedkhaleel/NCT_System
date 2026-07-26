let app;
try {
  app = require('../server.js');
  console.log('✅ Server loaded successfully');
} catch (err) {
  console.error('❌ Failed to load server.js:', err.message);
  console.error(err.stack);
  app = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: err.message,
      stack: err.stack
    });
  };
}
module.exports = app;
