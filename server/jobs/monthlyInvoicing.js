// jobs/monthlyInvoicing.js
const cron = require('node-cron');
const { DateTime } = require('luxon');
const Order = require('../models/orders');
const Shop = require('../models/shop');
const Invoice = require('../models/Invoice');

cron.schedule('5 0 1 * *', async () => {  // 00:05 on the 1st of every month
  console.log('🔄 Starting monthly invoicing job...');

  try {
    const now = DateTime.now().setZone('Africa/Nairobi');
    const periodEnd = now.startOf('month');             // e.g., Oct 1 00:00
    const periodStart = periodEnd.minus({ months: 1 }); // e.g., Sep 1 00:00
    const dueDate = periodEnd.plus({ days: 7 }).toJSDate();

    const startJS = periodStart.toJSDate();
    const endJS = periodEnd.toJSDate();

    // 1. Fetch all active shops
    const shops = await Shop.find({}).lean();
    if (!shops.length) {
      console.log('⚠️ No shops found for invoicing.');
      return;
    }

    // 2. Aggregate gross sales per shop in a SINGLE query
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

    // Map sales by shop ID for O(1) fast lookup
    const salesMap = new Map(
      salesAggregation.map((item) => [item._id.toString(), item.totalGross])
    );

    const invoicesToCreate = [];

    // 3. Prepare invoice documents in-memory
    for (const shop of shops) {
      const shopIdStr = shop._id.toString();

      // Prevent duplicate generation for this billing period
      const existingInvoice = await Invoice.findOne({
        shop: shop._id,
        periodStart: startJS,
        periodEnd: endJS
      });

      if (existingInvoice) {
        console.log(`⏩ Skipping shop ${shop.name || shop._id} — Invoice already generated.`);
        continue;
      }

      const gross = salesMap.get(shopIdStr) || 0;
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

    // 4. Bulk insert invoices
    if (invoicesToCreate.length > 0) {
      await Invoice.insertMany(invoicesToCreate);
      console.log(`✅ Successfully created ${invoicesToCreate.length} invoices.`);
    } else {
      console.log('ℹ️ No new invoices were required to be created.');
    }

  } catch (error) {
    console.error('❌ Error executing monthly invoicing job:', error);
  }
});