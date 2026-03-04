const express = require("express");
const router = express.Router();
const finance = require("../controllers/financeController");
const { protect } = require("../middleware/auth");

// Routes for financial profile
router.get("/profile", protect, finance.getFinancialProfile);
router.patch("/profile", protect, finance.updateFinancialProfile);

// Routes for monthly statistics
router.get("/statistics/monthly", protect, finance.getMonthlyStatistics);

// Routes for notification settings
router.get("/notification-settings", protect, finance.getNotificationSettings);
router.patch("/notification-settings", protect, finance.updateNotificationSettings);

module.exports = router;
