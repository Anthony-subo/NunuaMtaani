const { DateTime } = require('luxon');

function startOrRenew(shop, customStartDate = null) {
  const nairobiNow = DateTime.now().setZone('Africa/Nairobi');
  let baseDate = nairobiNow;

  if (customStartDate) {
    baseDate = DateTime.fromJSDate(new Date(customStartDate)).setZone('Africa/Nairobi');
  } else if (
    shop.subscription?.status === 'active' && 
    shop.subscription?.currentPeriodEnd && 
    new Date(shop.subscription.currentPeriodEnd) > new Date()
  ) {
    baseDate = DateTime.fromJSDate(new Date(shop.subscription.currentPeriodEnd)).setZone('Africa/Nairobi');
  }

  const start = baseDate.toJSDate();
  const end = baseDate.plus({ days: 30 }).toJSDate();
  const grace = baseDate.plus({ days: 37 }).toJSDate();

  shop.subscription = {
    ...shop.subscription,
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