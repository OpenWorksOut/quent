const express = require("express");
const router = express.Router();
const finance = require("../controllers/financeController");
const { protect } = require("../middleware/auth");

// Routes for financial profile
router.get("/profile", protect, finance.getFinancialProfile);
router.patch("/profile", protect, finance.updateFinancialProfile);

// Routes for monthly statistics
router.get("/statistics/monthly", protect, finance.getMonthlyStatistics);

module.exports = router;
