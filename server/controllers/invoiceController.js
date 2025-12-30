// server/controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');



exports.createInvoice = async (req, res) => {
  try {
    const { customer, totalAmount, invoiceDate, notes, invoiceNumber, paidAmount = 0 } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({ message: "Invoice number is required" });
    }

    // Calculate dueAmount = totalAmount - paidAmount
    const dueAmount = totalAmount - paidAmount;
    
    // Determine status based on amounts
    let status = "PENDING";
    if (paidAmount >= totalAmount) {
      status = "PAID";
    } else if (paidAmount > 0) {
      status = "PARTIALLY_PAID";
    }

    const invoice = await Invoice.create({
      customer,
      invoiceNumber,
      totalAmount,
      paidAmount,
      dueAmount, // Add dueAmount
      status, // Add status
      invoiceDate: invoiceDate || new Date(),
      notes,
    });

    await invoice.populate('customer');

    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};


// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name contactInfo.phone')
      .sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

// Get single invoice by id with payments
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name contactInfo.phone');
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    // Get payments for this invoice
    const payments = await Payment.find({ invoice: req.params.id })
      .sort({ paymentDate: -1 });
    
    res.json({ invoice, payments });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
};

// Update invoice (amount, status, etc.)
exports.updateInvoice = async (req, res) => {
  try {
    const { totalAmount, paidAmount, ...rest } = req.body;
    
    let updateData = { ...rest };
    
    // If totalAmount or paidAmount are provided, recalculate dueAmount and status
    if (totalAmount !== undefined || paidAmount !== undefined) {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      
      const newTotalAmount = totalAmount !== undefined ? totalAmount : invoice.totalAmount;
      const newPaidAmount = paidAmount !== undefined ? paidAmount : invoice.paidAmount;
      const newDueAmount = newTotalAmount - newPaidAmount;
      
      let status = "PENDING";
      if (newPaidAmount >= newTotalAmount) {
        status = "PAID";
      } else if (newPaidAmount > 0) {
        status = "PARTIALLY_PAID";
      }
      
      updateData = {
        ...updateData,
        totalAmount: newTotalAmount,
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        status
      };
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
};

// DELETE invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // delete related payments
    await Payment.deleteMany({ invoice: req.params.id });

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ message: "Failed to delete invoice" });
  }
};
