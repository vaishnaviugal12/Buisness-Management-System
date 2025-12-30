const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const merchantRoutes = require('./routes/merchant.routes');
const billRoutes = require('./routes/bill.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);

// Health
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date() }));

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;
