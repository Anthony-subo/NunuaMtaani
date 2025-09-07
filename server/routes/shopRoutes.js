const express = require('express');
const router = express.Router();
const {
  createShop,
  getShopByUserId,
  getAllShops,
  deleteShop,
  updateShopStatus
} = require('../controllers/shopController');

// Routes
router.post('/', createShop);
router.get('/user/:userId', getShopByUserId);
router.get('/', getAllShops);
router.delete('/:id', deleteShop);
router.put('/:shopId/status', updateShopStatus);

module.exports = router;
