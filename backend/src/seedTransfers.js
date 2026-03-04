const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Account = require('./models/Account');
const User = require('./models/User');
const config = require('./config');

async function seedTransactions() {
  try {
    // Connect to DB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to DB');

    const userId = '6905cbed02457f7c4d1338d7';
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    // Find user's accounts
    const userAccounts = await Account.find({ primaryOwner: userId });
    console.log(`Found ${userAccounts.length} accounts for user`);

    // Find all other accounts
    let allAccounts = await Account.find({ primaryOwner: { $ne: userId } });
    console.log(`Found ${allAccounts.length} other accounts`);

    // If not enough other accounts, create dummy ones
    if (allAccounts.length < 10) {
      console.log('Creating dummy users and accounts...');
      const dummyUsers = [];
      for (let i = 0; i < 10; i++) {
        const dummyUser = new User({
          firstName: `Dummy${i}`,
          lastName: 'User',
          email: `dummy${i}@example.com`,
          password: 'password123',
          phoneNumber: `123456789${i}`,
        });
        await dummyUser.save();
        dummyUsers.push(dummyUser);

        // Create account for dummy user
        const dummyAccount = new Account({
          accountNumber: `DUMMY${i.toString().padStart(10, '0')}`,
          accountType: 'checking',
          balance: 10000,
          currency: 'USD',
          primaryOwner: dummyUser._id,
          name: `Dummy Account ${i}`,
        });
        await dummyAccount.save();
        allAccounts.push(dummyAccount);
      }
      console.log('Created dummy accounts');
    }

    if (userAccounts.length === 0 || allAccounts.length === 0) {
      console.log('Not enough accounts to seed');
      return;
    }

    const transactions = [];
    const now = new Date();
    const tenYearsAgo = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);

    // Generate transactions for each month over 10 years
    for (let i = 0; i < 120; i++) {
      const monthStart = new Date(tenYearsAgo.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const monthEnd = new Date(monthStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 10-20 transactions per month
      const numTransactions = Math.floor(Math.random() * 11) + 10;

      for (let j = 0; j < numTransactions; j++) {
        const account = userAccounts[Math.floor(Math.random() * userAccounts.length)];
        const isIncome = Math.random() < 0.3; // 30% income, 70% expenses

        let type, transactionType, category, description, amount;

        if (isIncome) {
          type = 'credit';
          transactionType = 'income';
          const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund'];
          category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
          const incomeDescriptions = {
            'Salary': ['Monthly Salary', 'Bonus Payment', 'Overtime Pay'],
            'Freelance': ['Freelance Payment', 'Project Payment', 'Consulting Fee'],
            'Investment': ['Dividend Payment', 'Stock Sale', 'Crypto Earnings'],
            'Gift': ['Gift from Family', 'Birthday Gift', 'Cash Gift'],
            'Refund': ['Tax Refund', 'Purchase Refund', 'Service Refund']
          };
          description = incomeDescriptions[category][Math.floor(Math.random() * incomeDescriptions[category].length)];
          amount = Math.floor(Math.random() * 5000) + 500; // 500-5500
        } else {
          type = 'debit';
          transactionType = 'expense';
          const expenseCategories = ['Shopping', 'Food', 'Entertainment', 'Utilities', 'Transportation', 'Bills', 'Healthcare', 'Education', 'Travel', 'Transfer'];
          category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
          const expenseDescriptions = {
            'Shopping': ['Amazon.com Purchase', 'eBay Purchase', 'Walmart Shopping', 'Target Purchase', 'Online Store'],
            'Food': ['Grocery Store', 'Restaurant', 'Fast Food', 'Coffee Shop', 'Supermarket'],
            'Entertainment': ['Netflix Subscription', 'Spotify Premium', 'Movie Tickets', 'Concert Tickets', 'Gaming Purchase'],
            'Utilities': ['Electricity Bill', 'Gas Bill', 'Water Bill', 'Internet Bill', 'Phone Bill'],
            'Transportation': ['Gas Station', 'Uber Ride', 'Bus Ticket', 'Train Ticket', 'Parking Fee'],
            'Bills': ['Credit Card Payment', 'Loan Payment', 'Insurance Premium', 'Rent Payment', 'Mortgage Payment'],
            'Healthcare': ['Doctor Visit', 'Pharmacy', 'Dental Checkup', 'Medical Test', 'Hospital Bill'],
            'Education': ['Online Course', 'Book Purchase', 'Tuition Fee', 'School Supplies', 'Workshop Fee'],
            'Travel': ['Hotel Booking', 'Flight Ticket', 'Car Rental', 'Vacation Package', 'Travel Insurance'],
            'Transfer': ['Transfer to Friend', 'Send Money', 'Bank Transfer', 'Wire Transfer', 'Payment Transfer']
          };
          description = expenseDescriptions[category][Math.floor(Math.random() * expenseDescriptions[category].length)];
          amount = Math.floor(Math.random() * 500) + 10; // 10-510
        }

        const currency = account.currency || 'USD';
        const createdAt = new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime()));

        const transaction = {
          user: userId,
          type,
          transactionType,
          amount,
          currency,
          status: 'completed',
          description,
          category,
          reference: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          metadata: { account: account._id },
          createdAt,
        };

        transactions.push(transaction);
      }
    }

    console.log(`Seeding ${transactions.length} transactions`);
    await Transaction.insertMany(transactions);
    console.log('Seeding completed');

  } catch (error) {
    console.error('Error seeding transactions:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedTransactions();
