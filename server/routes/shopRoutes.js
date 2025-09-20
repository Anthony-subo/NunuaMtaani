const express = require("express");
const {
  createShop,
  getShopByUserId,
  getAllShops,
  deleteShop,
  updateShopStatus
} = require("../controllers/shopController");

const router = express.Router();

router.post("/", createShop);
router.get("/user/:userId", getShopByUserId);
router.get("/", getAllShops);
router.delete("/:id", deleteShop);
router.patch("/:shopId/status", updateShopStatus);

module.exports = router;
