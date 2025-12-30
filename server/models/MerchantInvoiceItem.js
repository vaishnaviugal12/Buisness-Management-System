const mongoose = require("mongoose");

const merchantInvoiceItemSchema = new mongoose.Schema(
  {
    merchantInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MerchantInvoice",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    itemDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MerchantInvoiceItem",
  merchantInvoiceItemSchema
);
