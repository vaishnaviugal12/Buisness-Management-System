const MerchantPayment = require('../models/MerchantPayment');
const MerchantInvoice = require('../models/MerchantInvoice');

// Record new payment against merchant invoice
exports.createMerchantPayment = async (req, res) => {
  try {
    const { merchantInvoice, amount, method, reference, note, paymentDate } = req.body;

    const invoice = await MerchantInvoice.findById(merchantInvoice);
    if (!invoice) {
      return res.status(404).json({ message: 'Merchant invoice not found' });
    }

    const payment = await MerchantPayment.create({
      merchantInvoice,
      amount,
      method: method || 'CASH',
      reference,
      note,
      paymentDate: paymentDate || new Date(),
    });

    invoice.paidAmount += amount;
    invoice.updatePaymentStatus();
    await invoice.save();

    await payment.populate('merchantInvoice');

    res.status(201).json({ payment, invoice });
  } catch (error) {
    console.error('Create merchant payment error:', error);
    res.status(500).json({ message: 'Failed to record merchant payment' });
  }
};

// Get all payments for a merchant invoice
exports.getMerchantPaymentsByInvoice = async (req, res) => {
  try {
    const payments = await MerchantPayment.find({
      merchantInvoice: req.params.invoiceId,
    })
      .populate('merchantInvoice', 'totalAmount paidAmount dueAmount status')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get merchant payments error:', error);
    res.status(500).json({ message: 'Failed to fetch merchant payments' });
  }
};

// Get all merchant payments
exports.getAllMerchantPayments = async (req, res) => {
  try {
    const payments = await MerchantPayment.find()
      .populate('merchantInvoice', 'totalAmount paidAmount dueAmount status merchant')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get all merchant payments error:', error);
    res.status(500).json({ message: 'Failed to fetch merchant payments' });
  }
};
// Update payment
exports.updateMerchantPayment = async (req, res) => {
  try {
    const { amount, method, note, paymentDate } = req.body;

    const payment = await MerchantPayment.findByIdAndUpdate(
      req.params.id,
      { amount, method, note, paymentDate },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Update invoice totals
    const invoice = await MerchantInvoice.findById(payment.merchantInvoice);
    const payments = await MerchantPayment.find({ merchantInvoice: invoice._id });
    invoice.paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.updatePaymentStatus();
    await invoice.save();

    res.json({ payment, invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update payment" });
  }
};
