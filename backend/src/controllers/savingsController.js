const SavingsGoal = require("../models/SavingsGoal");

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    payload.user = req.user._id;
    const goal = await SavingsGoal.create(payload);
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    goal.currentAmount += amount;
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
