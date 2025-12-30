const express = require("express");
const router = express.Router();
const {
  createInvoiceItem,
  getInvoiceItems,
  updateInvoiceItem
} = require("../controllers/merchantInvoiceItemController");
const authenticateToken = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", createInvoiceItem);
router.get("/invoice/:invoiceId", getInvoiceItems);
router.put("/:id", updateInvoiceItem); // ✅ Add this

module.exports = router;
