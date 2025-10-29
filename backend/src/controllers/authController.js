const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const { sendEmailVerificationOTP, sendLoginVerificationOTP } = require("../services/emailService");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
    });

    // Generate OTP and send email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 1000 * 60 * 5; // 5 minutes
    await user.save();

    try {
      await sendEmailVerificationOTP(
        user.email,
        `${user.firstName} ${user.lastName}`,
        otp
      );
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    // Do not issue token until email verified. Client should call verify-otp.
    res.status(201).json({ message: "OTP sent", email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user)
      return res.status(400).json({ message: "Invalid email or code" });

    if (!user.otp || !user.otpExpires)
      return res.status(400).json({ message: "No OTP set for this account" });

    if (Date.now() > new Date(user.otpExpires).getTime())
      return res.status(400).json({ message: "OTP expired" });

    if (user.otp !== code.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/verify-login-otp
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user)
      return res.status(400).json({ message: "Invalid email or code" });

    if (!user.otp || !user.otpExpires)
      return res.status(400).json({ message: "No OTP set for this account" });

    if (Date.now() > new Date(user.otpExpires).getTime())
      return res.status(400).json({ message: "OTP expired" });

    if (user.otp !== code.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No such user" });
    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 1000 * 60 * 5;
    await user.save();

    try {
      await sendEmailVerificationOTP(
        user.email,
        `${user.firstName} ${user.lastName}`,
        otp
      );
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
    }

    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    
    // Generate OTP for login verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 1000 * 60 * 5; // 5 minutes
    await user.save();

    try {
      await sendLoginVerificationOTP(
        user.email,
        `${user.firstName} ${user.lastName}`,
        otp,
        {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        }
      );
    } catch (mailErr) {
      console.error("Failed to send login verification email:", mailErr);
    }

    // Do not issue token until OTP verified. Client should call verify-login-otp.
    res.json({ message: "Login OTP sent", email: user.email, requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
