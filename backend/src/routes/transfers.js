const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/transferController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/", protect, ctrl.listForUser);
router.get("/:id", protect, ctrl.getById);

module.exports = router;
