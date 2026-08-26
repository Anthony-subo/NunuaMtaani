// services/subscription.js
const { DateTime } = require('luxon');

/**
 * Starts a new subscription or extends an existing one without losing remaining days.
 * Note: The caller is responsible for calling `await shop.save()` after this runs.
 */
function startOrRenew(shop, customStartDate = null) {
  const nairobiNow = DateTime.now().setZone('Africa/Nairobi');
  
  // 1. Determine the base date for the calculation
  let baseDate = nairobiNow;
  
  if (customStartDate) {
    // Safely parse whatever date object/string was passed in
    baseDate = DateTime.fromJSDate(new Date(customStartDate)).setZone('Africa/Nairobi');
  } else if (
    shop.subscription?.status === 'active' && 
    shop.subscription?.currentPeriodEnd && 
    new Date(shop.subscription.currentPeriodEnd) > new Date()
  ) {
    // If active and renewing early, append to the existing end date
    baseDate = DateTime.fromJSDate(shop.subscription.currentPeriodEnd).setZone('Africa/Nairobi');
  }

  // 2. Calculate periods
  const start = baseDate.toJSDate();
  const end = baseDate.plus({ days: 30 }).toJSDate();
  const grace = baseDate.plus({ days: 37 }).toJSDate();

  // 3. Safely update the object
  shop.subscription = {
    ...shop.subscription, // Preserve other existing subscription fields
    status: 'active',
    plan: 'standard-300',
    currentPeriodStart: start,
    currentPeriodEnd: end,
    graceUntil: grace
  };
  
  shop.isVisible = true;
  
  return shop; 
}

module.exports = { startOrRenew };