// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentsByInvoice,
  getAllPayments,
} = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/payments - Record new payment against invoice
router.post('/', createPayment);

// GET /api/payments/invoice/:invoiceId - Get all payments for specific invoice
router.get('/invoice/:invoiceId', getPaymentsByInvoice);

// GET /api/payments - Get all payments across all invoices
router.get('/', getAllPayments);

module.exports = router;
