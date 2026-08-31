const cron = require('node-cron');
const { DateTime } = require('luxon');
const Order = require('../models/orders');
const Shop = require('../models/shop');
const Invoice = require('../models/Invoice');

cron.schedule('5 0 1 * *', async () => {
  console.log('🔄 Running monthly invoicing job...');

  try {
    const now = DateTime.now().setZone('Africa/Nairobi');
    const periodEnd = now.startOf('month');
    const periodStart = periodEnd.minus({ months: 1 });
    const dueDate = periodEnd.plus({ days: 7 }).toJSDate();

    const startJS = periodStart.toJSDate();
    const endJS = periodEnd.toJSDate();

    const shops = await Shop.find({}).lean();
    if (!shops.length) return;

    const salesAggregation = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startJS, $lt: endJS }
        }
      },
      {
        $group: {
          _id: '$sellerShop',
          totalGross: { $sum: '$total' }
        }
      }
    ]);

    const salesMap = new Map(
      salesAggregation.map((item) => [item._id.toString(), item.totalGross])
    );

    const invoicesToCreate = [];

    for (const shop of shops) {
      const existingInvoice = await Invoice.findOne({
        shop: shop._id,
        periodStart: startJS,
        periodEnd: endJS
      });

      if (existingInvoice) continue;

      const gross = salesMap.get(shop._id.toString()) || 0;
      const commissionRate = shop.commission_rate || 0.05;
      const commissionDue = Math.round(gross * commissionRate);
      const subscriptionFee = 300;
      const totalDue = commissionDue + subscriptionFee;

      invoicesToCreate.push({
        shop: shop._id,
        periodStart: startJS,
        periodEnd: endJS,
        grossSales: gross,
        commissionRate,
        commissionDue,
        subscriptionFee,
        totalDue,
        dueDate
      });
    }

    if (invoicesToCreate.length > 0) {
      await Invoice.insertMany(invoicesToCreate);
      console.log(`✅ Created ${invoicesToCreate.length} monthly invoices.`);
    }
  } catch (error) {
    console.error('❌ Monthly Invoicing Error:', error);
  }
});