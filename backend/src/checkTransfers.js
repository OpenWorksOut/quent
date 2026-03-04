const mongoose = require('mongoose');
const Transfer = require('./models/Transfer');
const config = require('./config');

async function checkTransfers() {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to DB');

    const userId = '6901ff6ecee6eca253c59a4e';
    const transfers = await Transfer.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`Found ${transfers.length} transfers`);
    transfers.forEach(t => {
      console.log(`${t.createdAt} - ${t.amount} ${t.currency} - ${t.description} - Status: ${t.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkTransfers();
