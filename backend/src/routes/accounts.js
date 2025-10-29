const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/accountController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/me", protect, ctrl.getMyAccounts);
router.get("/:id", protect, ctrl.getById);
router.patch("/:id/withdrawals", protect, ctrl.setWithdrawals);
router.put("/:id", protect, ctrl.update);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
