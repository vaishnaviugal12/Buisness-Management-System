// server/controllers/customerController.js
const Customer = require('../models/Customer');

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const customer = await Customer.create({
      name,
      contactInfo: { phone },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// Get single customer by id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, isActive } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(phone && { 'contactInfo.phone': phone }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      { new: true }
    );

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
};
