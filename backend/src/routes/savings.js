const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/savingsController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getById);
router.post("/:id/deposit", protect, ctrl.deposit);

module.exports = router;
