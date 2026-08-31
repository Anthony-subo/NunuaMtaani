const cron = require('node-cron');
const Shop = require('../models/shop');

cron.schedule('0 0 * * *', async () => {
  console.log('⏳ Running daily subscription lifecycle check...');

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Move expired active shops straight to inactive if past grace period
    await Shop.updateMany(
      {
        'subscription.status': 'active',
        'subscription.currentPeriodEnd': { $lt: sevenDaysAgo }
      },
      {
        $set: { 'subscription.status': 'inactive', 'subscription.graceUntil': null }
      }
    );

    // 2. Move expired active shops into grace period
    const activeShopsToGrace = await Shop.find({
      'subscription.status': 'active',
      'subscription.currentPeriodEnd': { $lt: now, $gte: sevenDaysAgo }
    });

    for (const shop of activeShopsToGrace) {
      const graceUntil = new Date(shop.subscription.currentPeriodEnd);
      graceUntil.setDate(graceUntil.getDate() + 7);

      await Shop.findByIdAndUpdate(shop._id, {
        $set: {
          'subscription.status': 'grace',
          'subscription.graceUntil': graceUntil
        }
      });
    }

    // 3. Move expired grace shops to inactive
    await Shop.updateMany(
      {
        'subscription.status': 'grace',
        'subscription.graceUntil': { $lt: now }
      },
      {
        $set: { 'subscription.status': 'inactive', 'subscription.graceUntil': null }
      }
    );

    console.log('✅ Subscription lifecycle check completed.');
  } catch (err) {
    console.error('❌ Subscription Cron Error:', err);
  }
});