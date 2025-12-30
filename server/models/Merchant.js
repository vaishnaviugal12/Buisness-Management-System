// server/models/Merchant.js
const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Merchant unique/business number (editable)
    number: {
      type: String,
      required: false,
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

    // Bank details (all editable)
    bankAccount: {
      type: String,
      required: false,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
    },

    totalBills: {
      type: Number,
      default: 0,
    },
    totalPurchased: {
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

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;