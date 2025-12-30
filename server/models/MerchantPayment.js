const mongoose = require('mongoose');

const merchantPaymentSchema = new mongoose.Schema(
  {
    merchantInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchantInvoice',
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'],
      default: 'CASH',
    },
    reference: {
      type: String,
      trim: true, // UPI ref, cheque no, etc.
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MerchantPayment = mongoose.model('MerchantPayment', merchantPaymentSchema);

module.exports = MerchantPayment;