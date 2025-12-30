// server/routes/merchantInvoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMerchantInvoice,
  getMerchantInvoices,
  getMerchantInvoiceById,
  updateMerchantInvoice,
  deleteMerchantInvoice,
} = require('../controllers/merchantInvoiceController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/merchant-invoices - Create new merchant bill
router.post('/', createMerchantInvoice);

// GET /api/merchant-invoices - Get all merchant invoices
router.get('/', getMerchantInvoices);

// GET /api/merchant-invoices/:id - Get single invoice with payments
router.get('/:id', getMerchantInvoiceById);

// PUT /api/merchant-invoices/:id - Update invoice
router.put('/:id', updateMerchantInvoice);

// DELETE /api/merchant-invoices/:id - Delete invoice
router.delete('/:id', deleteMerchantInvoice);

module.exports = router;
