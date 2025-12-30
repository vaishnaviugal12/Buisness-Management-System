// server/controllers/merchantController.js
const Merchant = require('../models/Merchant');

// Create new merchant
exports.createMerchant = async (req, res) => {
  try {
    const { name, number, phone, bankAccount, ifscCode } = req.body;

    const merchant = await Merchant.create({
      name,
      number,
      contactInfo: { phone },
      bankAccount,
      ifscCode,
    });

    res.status(201).json(merchant);
  } catch (error) {
    console.error('Create merchant error:', error);
    res.status(500).json({ message: 'Failed to create merchant' });
  }
};

// Get all merchants
exports.getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find().sort({ createdAt: -1 });
    res.json(merchants);
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({ message: 'Failed to fetch merchants' });
  }
};

// Get single merchant by id
exports.getMerchantById = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    res.json(merchant);
  } catch (error) {
    console.error('Get merchant error:', error);
    res.status(500).json({ message: 'Failed to fetch merchant' });
  }
};

// Update merchant
exports.updateMerchant = async (req, res) => {
  try {
    const { name, number, phone, bankAccount, ifscCode, isActive } = req.body;

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(number && { number }),
        ...(phone && { 'contactInfo.phone': phone }),
        ...(bankAccount && { bankAccount }),
        ...(ifscCode && { ifscCode }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      { new: true }
    );

    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    res.json(merchant);
  } catch (error) {
    console.error('Update merchant error:', error);
    res.status(500).json({ message: 'Failed to update merchant' });
  }
};

// Delete merchant
exports.deleteMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findByIdAndDelete(req.params.id);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error('Delete merchant error:', error);
    res.status(500).json({ message: 'Failed to delete merchant' });
  }
};