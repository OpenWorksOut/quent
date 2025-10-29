const Notification = require("../models/Notification");

exports.list = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note)
      return res.status(404).json({ message: "Notification not found" });
    if (note.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    note.status = "read";
    note.readAt = new Date();
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
