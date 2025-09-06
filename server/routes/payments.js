const express = require("express");
const router = express.Router();
const { initiateSTK, stkCallback } = require("../controllers/paymentsController");

// ✅ Correctly mapped handlers
router.post("/stk/initiate", initiateSTK);
router.post("/stk/callback", stkCallback);

module.exports = router;
