// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const authenticateToken = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/customers - Create new customer
router.post('/', createCustomer);

// GET /api/customers - Get all customers
router.get('/', getCustomers);

// GET /api/customers/:id - Get single customer
router.get('/:id', getCustomerById);

// PUT /api/customers/:id - Update customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

module.exports = router;
