const Customer = require("../models/Customer");
const Supplier = require("../models/Merchant");
const Invoice = require("../models/Invoice");
const MerchantInvoice = require("../models/MerchantInvoice");

exports.getOverallReport = async (req, res) => {
  try {
    /* ---------- COUNTS ---------- */
    const totalCustomers = await Customer.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    /* ---------- CUSTOMER SALES ---------- */
    const customerInvoices = await Invoice.find();

    const customerSummary = {
      totalCustomers,
      totalBilled: customerInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
      ),
      totalPaid: customerInvoices.reduce(
        (sum, inv) => sum + (inv.paidAmount || 0),
        0
      ),
      totalPending: customerInvoices.reduce(
        (sum, inv) => sum + (inv.dueAmount || 0),
        0
      ),
    };

    /* ---------- SUPPLIER PURCHASES ---------- */
    const supplierInvoices = await MerchantInvoice.find();

    const supplierSummary = {
      totalSuppliers,
      totalPurchased: supplierInvoices.reduce(
        (sum, bill) => sum + (bill.totalAmount || 0),
        0
      ),
      totalPaid: supplierInvoices.reduce(
        (sum, bill) => sum + (bill.paidAmount || 0),
        0
      ),
      totalPending: supplierInvoices.reduce(
        (sum, bill) => sum + (bill.dueAmount || 0),
        0
      ),
    };

    /* ---------- BUSINESS POSITION ---------- */
    const businessSummary = {
      totalSales: customerSummary.totalBilled,
      totalPurchases: supplierSummary.totalPurchased,

      // true profit/loss visibility
      netPosition:
        customerSummary.totalBilled - supplierSummary.totalPurchased,
    };

    res.json({
      customerSummary,
      supplierSummary,
      businessSummary,
    });
  } catch (error) {
    console.error("Overall report error:", error);
    res.status(500).json({ message: "Failed to load report" });
  }
};

