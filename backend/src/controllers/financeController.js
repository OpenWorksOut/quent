const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Get the user's financial profile
exports.getFinancialProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      financialProfile: user.financialProfile || {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update the user's financial profile
exports.updateFinancialProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      "monthlyIncome",
      "monthlyBudget",
      "savingsGoal",
      "preferences",
    ];

    // Filter out any fields that aren't in the allowed list
    const validUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        validUpdates[`financialProfile.${key}`] = {
          ...value,
          lastUpdated: new Date(),
        };
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: validUpdates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      financialProfile: user.financialProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get monthly statistics including income, expenses, and savings rate
exports.getMonthlyStatistics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get all transactions for the current month
    const transactions = await Transaction.find({
      user: req.user._id,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Calculate totals
    const stats = transactions.reduce(
      (acc, t) => {
        if (t.type === "deposit") {
          acc.income += t.amount;
        } else if (t.type === "withdrawal" || t.type === "payment") {
          acc.expenses += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    // Calculate savings rate
    const savingsRate =
      stats.income > 0
        ? ((stats.income - stats.expenses) / stats.income) * 100
        : 0;

    // Get previous month's stats for comparison
    const prevStartOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const prevEndOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const prevTransactions = await Transaction.find({
      user: req.user._id,
      createdAt: {
        $gte: prevStartOfMonth,
        $lte: prevEndOfMonth,
      },
    });

    const prevStats = prevTransactions.reduce(
      (acc, t) => {
        if (t.type === "deposit") {
          acc.income += t.amount;
        } else if (t.type === "withdrawal" || t.type === "payment") {
          acc.expenses += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    // Calculate month-over-month changes
    const changes = {
      income: prevStats.income
        ? ((stats.income - prevStats.income) / prevStats.income) * 100
        : 0,
      expenses: prevStats.expenses
        ? ((stats.expenses - prevStats.expenses) / prevStats.expenses) * 100
        : 0,
      savingsRate:
        stats.income > 0 && prevStats.income > 0
          ? savingsRate -
            ((prevStats.income - prevStats.expenses) / prevStats.income) * 100
          : 0,
    };

    res.json({
      currentMonth: {
        income: stats.income,
        expenses: stats.expenses,
        savingsRate: savingsRate.toFixed(1),
      },
      changes: {
        income: changes.income.toFixed(1),
        expenses: changes.expenses.toFixed(1),
        savingsRate: changes.savingsRate.toFixed(1),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
