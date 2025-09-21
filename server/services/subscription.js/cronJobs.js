const cron = require("node-cron");
const Shop = require("./models/shop");

// 🕒 Runs every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running subscription check...");

  try {
    const now = new Date();

    // Find all active/grace shops
    const shops = await Shop.find({
      "subscription.status": { $in: ["active", "grace"] }
    });

    for (let shop of shops) {
      let updateData = null;

      // If active but expired → move to grace
      if (
        shop.subscription.status === "active" &&
        shop.subscription.currentPeriodEnd &&
        shop.subscription.currentPeriodEnd < now
      ) {
        const graceUntil = new Date(shop.subscription.currentPeriodEnd);
        graceUntil.setDate(graceUntil.getDate() + 7); // add 7 days grace

        updateData = {
          "subscription.status": "grace",
          "subscription.graceUntil": graceUntil
        };
      }

      // If grace but graceUntil passed → move to inactive
      if (
        shop.subscription.status === "grace" &&
        shop.subscription.graceUntil &&
        shop.subscription.graceUntil < now
      ) {
        updateData = {
          "subscription.status": "inactive",
          "subscription.graceUntil": null
        };
      }

      if (updateData) {
        await Shop.findByIdAndUpdate(shop._id, { $set: updateData });
        console.log(`✅ Updated ${shop.shop_name} → ${updateData["subscription.status"]}`);
      }
    }
  } catch (err) {
    console.error("❌ Error running subscription check:", err);
  }
});
