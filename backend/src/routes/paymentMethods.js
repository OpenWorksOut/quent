const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentMethodController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/", protect, ctrl.list);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
