// models/Invoice.js  (monthly per shop)
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  periodStart: { type: Date, required: true },
  periodEnd:   { type: Date, required: true },
  grossSales:  { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0.05 },
  commissionDue:  { type: Number, default: 0 },
  subscriptionFee: { type: Number, default: 300 },
  totalDue: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid','partially_paid','paid','waived'], default: 'unpaid' },
  issuedAt: { type: Date, default: Date.now },
  dueDate:  { type: Date },           // e.g., 7th of the next month
  payments: [{
    amount: Number,
    mpesaRef: String,
    at: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
