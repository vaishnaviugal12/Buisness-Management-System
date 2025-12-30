// server/controllers/paymentController.js
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Record new payment against an invoice
exports.createPayment = async (req, res) => {
  try {
    const { invoice: invoiceId, amount, method, reference, note } = req.body;

    // Find and validate invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Create payment
    const payment = await Payment.create({
      invoice: invoiceId,
      amount,
      method: method || 'CASH',
      reference,
      note,
    });

    // Update invoice totals and status
    invoice.paidAmount += amount;
    invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
    
    if (invoice.dueAmount <= 0) {
      invoice.status = 'PAID';
      invoice.dueAmount = 0;
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'PARTIALLY_PAID';
    }

    await invoice.save();

    // Populate payment data
    await payment.populate('invoice');

    res.status(201).json({ payment, invoice });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to record payment' });
  }
};

// Get all payments for an invoice
exports.getPaymentsByInvoice = async (req, res) => {
  try {
    const payments = await Payment.find({ invoice: req.params.invoiceId })
      .populate('invoice', 'totalAmount paidAmount dueAmount status')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Get all payments (with optional filters)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('invoice', 'totalAmount paidAmount dueAmount status customer')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

