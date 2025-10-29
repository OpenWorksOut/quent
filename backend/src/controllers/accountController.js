const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { sendAccountCreationEmail } = require("../services/emailService");

// Generate unique account number
const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;
  
  while (exists) {
    // Generate 8-digit account number
    accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existingAccount = await Account.findOne({ accountNumber });
    exists = !!existingAccount;
  }
  
  return accountNumber;
};

exports.create = async (req, res) => {
  try {
    const { 
      name, 
      accountType = "individual", 
      balance = 0, 
      currency = "USD",
      secondaryOwnerEmail,
      secondaryOwnerPermissions = "full"
    } = req.body;
    
    // Debug logging
    console.log("Account creation request:", { 
      name, 
      accountType, 
      balance, 
      currency, 
      secondaryOwnerEmail,
      fullBody: req.body 
    });
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Account name is required" });
    }
    
    // Generate unique account number
    const accountNumber = await generateAccountNumber();
    
    // Ensure accountType is properly set and valid
    const validAccountTypes = ["individual", "joint", "checking", "savings"];
    const finalAccountType = validAccountTypes.includes(accountType) ? accountType : "individual";
    
    console.log("Original accountType:", accountType, "Final accountType:", finalAccountType);
    console.log("Checking if finalAccountType === 'joint':", finalAccountType === "joint");
    console.log("secondaryOwnerEmail:", secondaryOwnerEmail);
    
    // Validate joint account requirements (using finalAccountType)
    if (finalAccountType === "joint") {
      console.log("ENTERING JOINT ACCOUNT VALIDATION - This should not happen for savings accounts!");
      if (!secondaryOwnerEmail) {
        console.log("ERROR: No secondary owner email provided for joint account");
        return res.status(400).json({ 
          message: "Joint accounts must have at least one secondary owner" 
        });
      }
      
      // Check if secondary owner exists
      const User = require("../models/User");
      const secondaryOwner = await User.findOne({ email: secondaryOwnerEmail });
      if (!secondaryOwner) {
        return res.status(400).json({ 
          message: "Secondary owner email not found. The user must be registered first." 
        });
      }
      
      // Prevent adding self as secondary owner
      if (secondaryOwner._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ 
          message: "You cannot add yourself as a secondary owner" 
        });
      }
    }
    
    const payload = {
      name,
      accountNumber,
      accountType: finalAccountType,
      balance: 0, // Always start with 0 balance
      currency,
      primaryOwner: req.user._id
    };
    
    console.log("Final payload accountType:", finalAccountType);
    
    // Add secondary owner for joint accounts
    if (finalAccountType === "joint" && secondaryOwnerEmail) {
      const User = require("../models/User");
      const secondaryOwner = await User.findOne({ email: secondaryOwnerEmail });
      payload.secondaryOwners = [{
        user: secondaryOwner._id,
        permissions: secondaryOwnerPermissions,
        status: "active" // Auto-approve for now, could be "pending" for invitation flow
      }];
    }
    
    console.log("Creating account with payload:", payload);
    
    const account = await Account.create(payload);
    
    console.log("Account created successfully:", account);
    
    // No initial transaction needed since balance is always 0
    
    // Send account creation email
    try {
      await sendAccountCreationEmail(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        {
          name: account.name,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          balance: account.balance
        }
      );
      console.log("Account creation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send account creation email:", emailError);
      // Don't fail the account creation if email fails
    }
    
    res.status(201).json({
      id: account._id,
      name: account.name,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt
    });
  } catch (err) {
    console.error("Account creation error:", err);
    console.error("Error stack:", err.stack);
    res.status(400).json({ message: err.message });
  }
};

exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      $or: [
        { primaryOwner: req.user._id },
        { "secondaryOwners.user": req.user._id },
      ],
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.hasAccess(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.checkPermission(req.user._id, "full"))
      return res.status(403).json({ message: "Forbidden" });
    Object.assign(account, req.body);
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (!account.checkPermission(req.user._id, "full"))
      return res.status(403).json({ message: "Forbidden" });
    await account.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle withdrawals enabled/disabled for an account
exports.setWithdrawals = async (req, res) => {
  try {
    const { enabled } = req.body;
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    // require transact permission to change withdrawal settings
    if (!account.checkPermission(req.user._id, "transact"))
      return res.status(403).json({ message: "Forbidden" });
    if (!account.limitations) account.limitations = {};
    account.limitations.withdrawalsEnabled = !!enabled;
    // optionally update withdrawal limit if provided
    if (req.body.withdrawalLimit !== undefined) {
      account.limitations.withdrawalLimit =
        Number(req.body.withdrawalLimit) || account.limitations.withdrawalLimit;
    }
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
