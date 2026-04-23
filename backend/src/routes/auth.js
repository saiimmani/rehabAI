const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// Health check — used by frontend to detect/warm up cold starts
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Private routes
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);
router.post('/enable-mfa', authMiddleware, authController.enableMfa);
router.post('/verify-mfa', authMiddleware, authController.verifyMfa);

// Get all doctors and physiotherapists (for patient booking)
router.get('/professionals', authMiddleware, async (req, res) => {
  try {
    const professionals = await User.find({
      role: { $in: ['doctor', 'physiotherapist'] },
      isActive: { $ne: false }
    }).select('firstName lastName email role');
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching professionals', error: error.message });
  }
});

module.exports = router;
