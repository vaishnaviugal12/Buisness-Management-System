// server/routes/merchantRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMerchant,
  getMerchants,
  getMerchantById,
  updateMerchant,
  deleteMerchant,
} = require('../controllers/merchantController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/merchants - Create new merchant
router.post('/', createMerchant);

// GET /api/merchants - Get all merchants
router.get('/', getMerchants);

// GET /api/merchants/:id - Get single merchant
router.get('/:id', getMerchantById);

// PUT /api/merchants/:id - Update merchant
router.put('/:id', updateMerchant);

// DELETE /api/merchants/:id - Delete merchant
router.delete('/:id', deleteMerchant);

module.exports = router;