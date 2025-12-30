// server/models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    invoiceNumber: {          // NEW
      type: Number,
      required: true,
      unique: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// helper
invoiceSchema.methods.updatePaymentStatus = function () {
  this.dueAmount = this.totalAmount - this.paidAmount;
  if (this.dueAmount <= 0) {
    this.status = 'PAID';
    this.dueAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = 'PARTIALLY_PAID';
  } else {
    this.status = 'PENDING';
  }
};

module.exports = mongoose.model('Invoice', invoiceSchema);
