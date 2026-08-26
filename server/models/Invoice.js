// models/Invoice.js (monthly per shop)
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true,
    index: true 
  },
  periodStart: { type: Date, required: true },
  periodEnd:   { type: Date, required: true },
  grossSales:  { type: Number, default: 0, min: 0 },
  commissionRate: { type: Number, default: 0.05, min: 0, max: 1 },
  commissionDue:  { type: Number, default: 0, min: 0 },
  subscriptionFee: { type: Number, default: 300, min: 0 },
  totalDue: { type: Number, default: 0, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 }, // Track total settled so far
  status: { 
    type: String, 
    enum: ['unpaid', 'partially_paid', 'paid', 'waived'], 
    default: 'unpaid',
    index: true
  },
  issuedAt: { type: Date, default: Date.now },
  dueDate:  { type: Date },          // e.g., 7th of the next month
  payments: [{
    amount: { type: Number, required: true, min: 0 },
    mpesaRef: { type: String, required: true, uppercase: true, trim: true },
    at: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate invoices for the same shop in the same period
InvoiceSchema.index({ shop: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

// Index for fast payment lookup by M-Pesa receipt
InvoiceSchema.index({ 'payments.mpesaRef': 1 });

// Virtual for remaining balance
InvoiceSchema.virtual('balanceDue').get(function() {
  return Math.max(0, this.totalDue - this.amountPaid);
});

module.exports = mongoose.model('Invoice', InvoiceSchema);