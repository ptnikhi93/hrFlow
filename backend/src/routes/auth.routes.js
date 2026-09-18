const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Test route: any logged-in user can access
router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'Token is valid', user: req.user });
});

// Test route: only admin can access
router.get('/admin-only', verifyToken, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

module.exports = router;