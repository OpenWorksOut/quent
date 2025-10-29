const PaymentMethod = require("../models/PaymentMethod");

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    payload.user = req.user._id;
    const pm = await PaymentMethod.create(payload);
    res.status(201).json(pm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const list = await PaymentMethod.find({ user: req.user._id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const pm = await PaymentMethod.findById(req.params.id);
    if (!pm)
      return res.status(404).json({ message: "Payment method not found" });
    if (pm.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    await pm.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
