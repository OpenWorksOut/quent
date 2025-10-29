const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, ctrl.list);
router.post("/:id/read", protect, ctrl.markRead);

module.exports = router;
