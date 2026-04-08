const express = require('express');
const botController = require('../controllers/botController');

const router = express.Router();

// Bot webhook routes
router.use('/bot', botController);

// Individual endpoints for direct API calls
router.get('/bot/grades/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await require('../controllers/botController').handleGetGrades({ studentId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

router.get('/bot/payments/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await require('../controllers/botController').handleGetPayments({ studentId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

router.get('/bot/courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await require('../controllers/botController').handleGetCourses({ studentId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

module.exports = router;