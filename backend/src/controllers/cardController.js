const Card = require("../models/Card");

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    payload.user = req.user._id;
    const card = await Card.create(payload);
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    Object.assign(card, req.body);
    await card.save();
    res.json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    await card.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
