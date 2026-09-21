export const SALARY_MONTHLY = 128321;

export const DEFAULT_BUDGET_CATEGORIES = [
  // Living / Fixed Obligations
  { id: 'mother_support', name: 'Mother Support', category: 'Living', planned: 35000, account: 'HDFC' },
  { id: 'rent', name: 'House Rent', category: 'Living', planned: 9000, account: 'HDFC' },
  { id: 'food_personal', name: 'Food & Groceries', category: 'Living', planned: 12000, account: 'HDFC' },
  { id: 'fuel_petrol', name: 'Petrol & Commute', category: 'Living', planned: 2000, account: 'HDFC' },
  { id: 'chit_fund', name: 'Chit Fund Allocation', category: 'Living', planned: 4070, account: 'HDFC' },
  { id: 'mobile_bills', name: 'Mobile, Utilities & Wi-Fi', category: 'Living', planned: 1250, account: 'HDFC' },
  { id: 'credit_card', name: 'Credit Card Discretionary', category: 'Living', planned: 0, account: 'HDFC' },
  // Systematic Investment Plans
  { id: 'hdfc_flexi', name: 'HDFC Flexi Cap Fund', category: 'Investments', planned: 3000, account: 'Demat' },
  { id: 'invesco_mid', name: 'Invesco India Midcap Fund', category: 'Investments', planned: 3000, account: 'Demat' },
  { id: 'nippon_nifty', name: 'Nippon India Nifty 50 Index', category: 'Investments', planned: 2500, account: 'Demat' },
  { id: 'quant_small', name: 'Quant Small Cap Fund', category: 'Investments', planned: 2500, account: 'Demat' },
  { id: 'gold_reserve', name: 'Gold ETF / SGB Reserve', category: 'Investments', planned: 2000, account: 'Demat' },
  // Savings Reserves
  { id: 'sbi_emergency', name: 'SBI Emergency Tank Transfer', category: 'Savings', planned: 15000, account: 'SBI' },
  { id: 'kvb_car', name: 'KVB Car Down Payment Pool', category: 'Savings', planned: 12000, account: 'KVB' },
  { id: 'kvb_insurance', name: 'KVB Annual Insurance Tank', category: 'Savings', planned: 7000, account: 'KVB' }
];

export const BACKEND_CODE = {
  server: `// server.js - Node.js & Express REST API Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas cluster');
  app.listen(PORT, () => console.log(\`🚀 Server running on port \${PORT}\`));
})
.catch((err) => console.error('❌ MongoDB Connection Error:', err));`,

  modelExpense: `// models/Expense.js - Mongoose Schema for Transactions
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a description or title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an expense amount']
  },
  category: {
    type: String,
    required: true,
    enum: ['Living', 'Investments', 'Savings', 'Discretionary', 'Emergency']
  },
  budgetItemId: {
    type: String,
    default: null
  },
  account: {
    type: String,
    enum: ['HDFC', 'SBI', 'KVB', 'Demat'],
    default: 'HDFC'
  },
  monthYear: {
    type: String,
    required: true // e.g. "Sep 2026"
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for fast query per month
ExpenseSchema.index({ monthYear: 1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);`,

  modelBudget: `// models/Budget.js - Monthly Allocation Schema
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  monthYear: {
    type: String,
    required: true,
    unique: true // e.g. "Sep 2026"
  },
  monthlySalary: {
    type: Number,
    default: 115000
  },
  allocations: [{
    itemId: String,
    name: String,
    category: String,
    plannedAmount: Number,
    account: String
  }],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);`,

  routesExpense: `// routes/expenseRoutes.js - Express Controller & Routes
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET /api/expenses?month=Sep%202026
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { monthYear: month } : {};
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/expenses - Add an expense
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/expenses/summary/:month
router.get('/summary/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const summary = await Expense.aggregate([
      { $match: { monthYear: month } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;`,

  envFile: `# .env configuration file
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/personal_finance_2026?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_2026`,

  packageJson: `{
  "name": "personal-finance-backend",
  "version": "1.0.0",
  "description": "NodeJS Express MongoDB Backend for Personal Finance Cash Flow Planner",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`
};
