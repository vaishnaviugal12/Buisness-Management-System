// server/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/invoices - Create new invoice
router.post('/', createInvoice);

// GET /api/invoices - Get all invoices
router.get('/', getInvoices);

// GET /api/invoices/:id - Get single invoice with payments
router.get('/:id', getInvoiceById);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', updateInvoice);
router.delete("/:id",  deleteInvoice); // 👈 add

module.exports = router;
