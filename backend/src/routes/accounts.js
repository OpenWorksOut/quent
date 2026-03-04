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

// Co-owner management for joint accounts
router.post("/:id/co-owners", protect, ctrl.addCoOwner);
router.delete("/:id/co-owners/:ownerId", protect, ctrl.removeCoOwner);
router.patch("/:id/co-owners/:ownerId", protect, ctrl.updateCoOwner);

module.exports = router;
