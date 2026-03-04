const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadProfileImage } = require("../middleware/upload");

router.get("/", protect, ctrl.getAll);
router.get("/:id", protect, ctrl.getById);
router.put("/:id", protect, ctrl.update);
router.post("/profile-image", protect, uploadProfileImage.single('profileImage'), ctrl.updateProfileImage);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
