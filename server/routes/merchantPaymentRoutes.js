// server/routes/merchantPaymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMerchantPayment,
  getMerchantPaymentsByInvoice,
  getAllMerchantPayments,
  updateMerchantPayment
} = require('../controllers/merchantPaymentController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/merchant-payments - Record payment against merchant invoice
router.post('/', createMerchantPayment);

// GET /api/merchant-payments/invoice/:invoiceId - Payments for specific invoice
router.get('/invoice/:invoiceId', getMerchantPaymentsByInvoice);

// GET /api/merchant-payments - All merchant payments
router.get('/', getAllMerchantPayments);
router.put("/:id", updateMerchantPayment); // ✅ Add this

module.exports = router;
