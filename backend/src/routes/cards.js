const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/cardController");
const { protect } = require("../middleware/auth");

router.post("/", protect, ctrl.create);
router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.getById);
router.put("/:id", protect, ctrl.update);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
