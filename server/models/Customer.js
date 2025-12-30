// server/models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      phone: {
        type: String,
        required: true,
        default: '0000000000',
        trim: true,
      },
    },
    totalInvoices: {
      type: Number,
      default: 0,
    },
    totalBilled: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    totalDue: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
