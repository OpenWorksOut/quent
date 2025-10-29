const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/verify-otp", auth.verifyOtp);
router.post("/verify-login-otp", auth.verifyLoginOtp);
router.post("/resend-otp", auth.resendOtp);
router.get("/me", protect, auth.me);

module.exports = router;
