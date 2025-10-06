const User = require('../models/User');

async function findOrCreateUser(telegramId) {
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = new User({ telegramId });
    await user.save();
  }
  return user;
}

async function addBalance(telegramId, amount) {
  const user = await findOrCreateUser(telegramId);
  user.balance += amount;
  await user.save();
  return user;
}

async function setJob(telegramId, job) {
  const user = await findOrCreateUser(telegramId);
  user.job = job;
  await user.save();
  return user;
}

async function getUsers() {
  return User.find().sort({ balance: -1 });
}

module.exports = { findOrCreateUser, addBalance, setJob, getUsers };
