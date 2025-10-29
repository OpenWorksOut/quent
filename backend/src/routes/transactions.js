const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/account/:accountId", protect, ctrl.getForAccount);
router.get("/user", protect, ctrl.listForUser);
router.get("/:id", protect, ctrl.getById);

module.exports = router;
