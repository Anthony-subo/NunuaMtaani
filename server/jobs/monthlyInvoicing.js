// jobs/monthlyInvoicing.js
const cron = require('node-cron');
const { DateTime } = require('luxon');
const Order = require('../models/orders');
const Shop = require('../models/shop');
const Invoice = require('../models/Invoice');

cron.schedule('5 0 1 * *', async () => {  // 00:05 on the 1st monthly
  const now = DateTime.now().setZone('Africa/Nairobi');
  const periodEnd = now.startOf('month');            // start of current month
  const periodStart = periodEnd.minus({ months: 1 }); // previous month window

  const shops = await Shop.find({});
  for (const shop of shops) {
    const orders = await Order.find({
      sellerShop: shop._id,
      status: 'paid',
      createdAt: { $gte: periodStart.toJSDate(), $lt: periodEnd.toJSDate() }
    });

    const gross = orders.reduce((s, o) => s + (o.total || 0), 0);
    const commissionDue = Math.round(gross * (shop.commission_rate || 0.05));
    const subscriptionFee = 300;
    const totalDue = commissionDue + subscriptionFee;

    await Invoice.create({
      shop: shop._id,
      periodStart: periodStart.toJSDate(),
      periodEnd: periodEnd.toJSDate(),
      grossSales: gross,
      commissionRate: shop.commission_rate || 0.05,
      commissionDue,
      subscriptionFee,
      totalDue,
      dueDate: periodEnd.plus({ days: 7 }).toJSDate()
    });
  }
});
