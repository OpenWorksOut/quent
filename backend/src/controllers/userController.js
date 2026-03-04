const User = require("../models/User");

exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password; // password change should be separate
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Detect if running in serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

    // Generate profile image path/identifier
    let profileImagePath;
    if (isServerless) {
      // For serverless, just store the filename (files are in memory, not persisted)
      // In a production app, you'd upload to cloud storage (S3, Vercel Blob, etc.)
      profileImagePath = `profile-${req.user._id}-${Date.now()}`;
    } else {
      // For local development, store actual file path
      profileImagePath = `/uploads/${req.file.filename}`;
    }

    // Update user's profileImage field
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: profileImagePath },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile image updated successfully",
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete a user by id
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
