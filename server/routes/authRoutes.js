const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshAccessToken,
  verifyToken
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', refreshAccessToken);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/verify', verifyToken);
router.post('/logout', logout);

module.exports = router;