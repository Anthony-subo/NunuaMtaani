const cron = require("node-cron");
const Shop = require("./models/shop");

// 🕒 Runs every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running daily subscription lifecycle check...");

  try {
    const now = new Date();

    // 1. Move expired ACTIVE shops directly to INACTIVE if their 7-day grace window has already elapsed
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const expiredPastGraceResult = await Shop.updateMany(
      {
        "subscription.status": "active",
        "subscription.currentPeriodEnd": { $lt: sevenDaysAgo }
      },
      {
        $set: {
          "subscription.status": "inactive",
          "subscription.graceUntil": null
        }
      }
    );

    // 2. Move remaining expired ACTIVE shops to GRACE (grace period = periodEnd + 7 days)
    const activeShopsToGrace = await Shop.find({
      "subscription.status": "active",
      "subscription.currentPeriodEnd": { $lt: now, $gte: sevenDaysAgo }
    });

    for (const shop of activeShopsToGrace) {
      const graceUntil = new Date(shop.subscription.currentPeriodEnd);
      graceUntil.setDate(graceUntil.getDate() + 7);

      await Shop.findByIdAndUpdate(shop._id, {
        $set: {
          "subscription.status": "grace",
          "subscription.graceUntil": graceUntil
        }
      });
    }

    // 3. Move GRACE shops whose graceUntil has passed to INACTIVE
    const graceToInactiveResult = await Shop.updateMany(
      {
        "subscription.status": "grace",
        "subscription.graceUntil": { $lt: now }
      },
      {
        $set: {
          "subscription.status": "inactive",
          "subscription.graceUntil": null
        }
      }
    );

    console.log(`✅ Subscription check complete:`);
    console.log(`   - Moved to Grace: ${activeShopsToGrace.length}`);
    console.log(`   - Moved to Inactive: ${expiredPastGraceResult.modifiedCount + graceToInactiveResult.modifiedCount}`);

  } catch (err) {
    console.error("❌ Error running subscription check:", err);
  }
});