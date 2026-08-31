const mongoose = require('mongoose');

const PaymentSubSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  mpesaRef: { type: String, required: true, trim: true },
  at: { type: Date, default: Date.now }
}, { _id: true });

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
  status: { 
    type: String, 
    enum: ['unpaid', 'partially_paid', 'paid', 'waived'], 
    default: 'unpaid',
    index: true 
  },
  issuedAt: { type: Date, default: Date.now },
  dueDate:  { type: Date, required: true },
  payments: [PaymentSubSchema]
}, { timestamps: true });

InvoiceSchema.index({ shop: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);