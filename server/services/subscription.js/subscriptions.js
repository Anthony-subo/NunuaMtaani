// services/subscription.js
const { DateTime } = require('luxon'); // npm i luxon

function startOrRenew(shop, from = DateTime.now().setZone('Africa/Nairobi')) {
  const start = from.toJSDate();
  const end = from.plus({ days: 30 }).toJSDate();
  const grace = from.plus({ days: 37 }).toJSDate(); // 7-day grace
  shop.subscription = {
    status: 'active',
    plan: 'standard-300',
    currentPeriodStart: start,
    currentPeriodEnd: end,
    graceUntil: grace
  };
  shop.isVisible = true;
  return shop;
}
