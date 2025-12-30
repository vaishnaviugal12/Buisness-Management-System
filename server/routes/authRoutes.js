const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import authenticateToken middleware
const authenticateToken = require('../middlewares/authMiddleware');

const VALID_USER = {
  email: 'vaishnaviugale@gmail.com',
  password: 'ugale1234',
};

// ✅ FIXED: Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, message: 'Token is valid' });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== VALID_USER.email || password !== VALID_USER.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Create JWT payload
  const payload = { email };

  // Sign JWT. Set expiration as desired
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;
