const router = require("express").Router();
const InvoiceItem = require("../models/InvoiceItem");
const auth = require("../middlewares/authMiddleware");

// Get items by invoice
router.get("/invoice/:invoiceId", auth, async (req, res) => {
  const items = await InvoiceItem.find({ invoice: req.params.invoiceId });
  res.json(items);
});

// Add item
router.post("/", auth, async (req, res) => {
  const item = await InvoiceItem.create(req.body);
  res.status(201).json(item);
});

// Update item
router.put("/:id", auth, async (req, res) => {
  const item = await InvoiceItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(item);
});

module.exports = router;
