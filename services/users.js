// services/users.js
const User = require('../models/User');

async function canClaim(telegramId) {
  const user = await User.findOne({ telegramId });
  if (!user) return false;

  const now = new Date();
  if (!user.lastClaim) return true;

  const diff = (now - user.lastClaim) / 1000 / 60; // فرق بالدقائق
  return diff >= 1440; // 24 ساعة
}

// عند استلام الراتب
async function claimSalary(telegramId, amount) {
  const user = await User.findOne({ telegramId });
  if (!user) return null;

  const can = await canClaim(telegramId);
  if (!can) return null;

  user.balance += amount;
  user.lastClaim = new Date();
  await user.save();
  return user;
}

// بقية الدوال
async function findOrCreateUser(telegramId) {
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = new User({ telegramId, balance: 0, job: null, lastClaim: null });
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

async function setJob(telegramId, jobName) {
  const user = await findOrCreateUser(telegramId);
  user.job = jobName;
  await user.save();
  return user;
}

async function getUsers() {
  return await User.find().sort({ balance: -1 });
}

module.exports = { findOrCreateUser, addBalance, setJob, getUsers, canClaim, claimSalary };
