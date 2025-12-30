const MerchantInvoice = require("../models/MerchantInvoice");
const MerchantPayment = require("../models/MerchantPayment");
const MerchantInvoiceItem = require("../models/MerchantInvoiceItem");

/**
 * ✅ Create new merchant invoice
 * NOTE:
 * - totalAmount should START from 0
 * - actual total will come from invoice items
 */
// controllers/merchantInvoiceController.js

exports.createMerchantInvoice = async (req, res) => {
  try {
    const { merchant, billDate, notes, billNumber } = req.body;

    if (!billNumber) {
      return res.status(400).json({ message: "Bill number is required" });
    }

    const invoice = await MerchantInvoice.create({
      merchant,
      billNumber,
      billDate: billDate || new Date(),
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      notes,
    });

    await invoice.populate("merchant", "name contactInfo.phone");

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Create merchant invoice error:", error);
    res.status(500).json({ message: "Failed to create merchant invoice" });
  }
};


/**
 * ✅ Get all merchant invoices
 * Used in SupplierDetails page
 */
exports.getMerchantInvoices = async (req, res) => {
  try {
    const invoices = await MerchantInvoice.find()
      .populate("merchant", "name contactInfo.phone")
      .sort({ billDate: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Get merchant invoices error:", error);
    res.status(500).json({ message: "Failed to fetch merchant invoices" });
  }
};

/**
 * ✅ Get single merchant invoice
 * RETURNS:
 * - invoice
 * - payments
 * - items (purchase history)
 */
exports.getMerchantInvoiceById = async (req, res) => {
  try {
    const invoice = await MerchantInvoice.findById(req.params.id)
      .populate("merchant", "name contactInfo.phone");

    if (!invoice) {
      return res.status(404).json({ message: "Merchant invoice not found" });
    }

    const payments = await MerchantPayment.find({
      merchantInvoice: req.params.id,
    }).sort({ paymentDate: -1 });

    const items = await MerchantInvoiceItem.find({
      merchantInvoice: req.params.id,
    }).sort({ itemDate: -1 });

    res.json({
      invoice,
      payments,
      items,
    });
  } catch (error) {
    console.error("Get merchant invoice error:", error);
    res.status(500).json({ message: "Failed to fetch merchant invoice" });
  }
};

/**
 * ✅ Update merchant invoice (notes, billDate only)
 * ❌ DO NOT update totalAmount manually
 */
exports.updateMerchantInvoice = async (req, res) => {
  try {
    const { billDate, notes } = req.body;

    const invoice = await MerchantInvoice.findByIdAndUpdate(
      req.params.id,
      { billDate, notes },
      { new: true }
    ).populate("merchant", "name contactInfo.phone");

    if (!invoice) {
      return res.status(404).json({ message: "Merchant invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Update merchant invoice error:", error);
    res.status(500).json({ message: "Failed to update merchant invoice" });
  }
};

/**
 * ✅ Delete merchant invoice
 * ALSO deletes:
 * - related payments
 * - related invoice items
 */
exports.deleteMerchantInvoice = async (req, res) => {
  try {
    const invoice = await MerchantInvoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Merchant invoice not found" });
    }

    await MerchantPayment.deleteMany({
      merchantInvoice: req.params.id,
    });

    await MerchantInvoiceItem.deleteMany({
      merchantInvoice: req.params.id,
    });

    res.json({ message: "Merchant invoice deleted successfully" });
  } catch (error) {
    console.error("Delete merchant invoice error:", error);
    res.status(500).json({ message: "Failed to delete merchant invoice" });
  }
};
