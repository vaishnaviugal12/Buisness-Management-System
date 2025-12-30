const MerchantInvoiceItem = require("../models/MerchantInvoiceItem");
const MerchantInvoice = require("../models/MerchantInvoice");

// ➕ Add Item
exports.createInvoiceItem = async (req, res) => {
  try {
    const { merchantInvoice, itemName, amount, itemDate, description } = req.body;

    const invoice = await MerchantInvoice.findById(merchantInvoice);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const item = await MerchantInvoiceItem.create({
      merchantInvoice,
      itemName,
      amount,
      itemDate: itemDate || invoice.billDate,
      description,
    });

    // 🔁 Recalculate invoice total
    const items = await MerchantInvoiceItem.find({ merchantInvoice });
    invoice.totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    invoice.updatePaymentStatus();
    await invoice.save();

    res.status(201).json({ item, invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add invoice item" });
  }
};

// 📥 Get Items by Invoice
exports.getInvoiceItems = async (req, res) => {
  try {
    const items = await MerchantInvoiceItem.find({
      merchantInvoice: req.params.invoiceId,
    }).sort({ itemDate: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoice items" });
  }
};

// Update invoice item
exports.updateInvoiceItem = async (req, res) => {
  try {
    const { itemName, amount, itemDate, description } = req.body;

    const item = await MerchantInvoiceItem.findByIdAndUpdate(
      req.params.id,
      { itemName, amount, itemDate, description },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Invoice item not found" });

    // Update invoice total
    const invoice = await MerchantInvoice.findById(item.merchantInvoice);
    const items = await MerchantInvoiceItem.find({ merchantInvoice: invoice._id });
    invoice.totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    invoice.updatePaymentStatus();
    await invoice.save();

    res.json({ item, invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update invoice item" });
  }
};
