// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://buisness-management-system-frontend.onrender.com"
  ],
  credentials: true,
}));



app.use(express.json());
app.use(morgan('dev'));

// Import all routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const merchantInvoiceRoutes = require('./routes/merchantInvoiceRoutes');
const merchantPaymentRoutes = require('./routes/merchantPaymentRoutes');


// Public route - authentication
app.use('/api/auth', authRoutes);

// Protected routes - require JWT token
const authenticateToken = require('./middlewares/authMiddleware');
app.use(authenticateToken);

// All business routes
app.use('/api/customers', customerRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

app.use('/api/merchant-invoices', merchantInvoiceRoutes);
app.use('/api/merchant-payments', merchantPaymentRoutes);
app.use("/api/merchant-invoice-items", require("./routes/merchantInvoiceItemRoutes"));
app.use("/api/invoice-items", require("./routes/invoiceItemRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));


// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Business Management System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});


// MongoDB connection
const connectDB = require('./config/db');
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});