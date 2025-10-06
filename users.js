// // users.js
// const User = require("./models/User");

// const SALARY_COOLDOWN = 60 * 1000;       // 1 دقيقة
// const INVEST_COOLDOWN = 10 * 60 * 1000;  // 10 دقائق
// const LUCK_BET_COOLDOWN = 60 * 1000;     // 1 دقيقة

// // ======= الراتب =======
// async function canClaim(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return true;
//   return Date.now() - (user.lastClaim?.getTime() || 0) >= SALARY_COOLDOWN;
// }

// async function claimSalary(telegramId, job, name) {
//   let user = await User.findOne({ telegramId });
//   if (!user) user = new User({ telegramId, name });

//   user.balance += job.salary;
//   user.lastClaim = new Date();
//   user.name = name || user.name;

//   await user.save();
//   return user.balance;
// }

// async function getRemainingTime(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return 0;
//   const remaining = SALARY_COOLDOWN - (Date.now() - (user.lastClaim?.getTime() || 0));
//   return remaining > 0 ? remaining : 0;
// }

// // ======= الرصيد =======
// async function getBalance(telegramId) {
//   const user = await User.findOne({ telegramId });
//   return user ? user.balance : 0;
// }

// // ======= الاستثمار =======
// async function canInvest(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return true;
//   return Date.now() - (user.lastInvest?.getTime() || 0) >= INVEST_COOLDOWN;
// }

// async function invest(telegramId, name) {
//   let user = await User.findOne({ telegramId });
//   if (!user) user = new User({ telegramId, name });

//   if (user.balance <= 0) return { success: false, profit: 0, newBalance: user.balance };

//   const percentage = Math.floor(Math.random() * 20) + 1; // 1%-20%
//   const profit = Math.floor(user.balance * (percentage / 100));

//   user.balance += profit;
//   user.lastInvest = new Date();
//   user.name = name || user.name;

//   await user.save();
//   return { success: true, profit, percentage, newBalance: user.balance };
// }

// async function getInvestRemainingTime(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return 0;
//   const remaining = INVEST_COOLDOWN - (Date.now() - (user.lastInvest?.getTime() || 0));
//   return remaining > 0 ? remaining : 0;
// }

// // ======= الحظ بالرهان =======
// async function canLuckBet(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return true;
//   return Date.now() - (user.lastLuckBet?.getTime() || 0) >= LUCK_BET_COOLDOWN;
// }

// async function getLuckBetRemainingTime(telegramId) {
//   const user = await User.findOne({ telegramId });
//   if (!user) return 0;
//   const remaining = LUCK_BET_COOLDOWN - (Date.now() - (user.lastLuckBet?.getTime() || 0));
//   return remaining > 0 ? remaining : 0;
// }

// async function luck100(telegramId, amount, name) {
//   let user = await User.findOne({ telegramId });
//   if (!user) return { success: false, msg: "🚫 لا يوجد رصيد لديك." };

//   amount = Number(amount);
//   if (isNaN(amount) || amount <= 0) return { success: false, msg: "🚫 الرجاء إدخال مبلغ صحيح." };
//   if (amount > user.balance) return { success: false, msg: "🚫 الرهان أكبر من رصيدك الحالي." };

//   const win = Math.random() < 0.5;
//   const change = win ? amount : -amount;
//   user.balance += change;
//   user.lastLuckBet = new Date();
//   user.name = name || user.name;

//   await user.save();
//   return { success: true, win, change, newBalance: user.balance };
// }

// // ======= التصنيف =======
// async function getLeaderboard() {
//   const users = await User.find().sort({ balance: -1 }).limit(10);
//   return users.map(u => ({ id: u.telegramId, name: u.name, balance: u.balance }));
// }

// module.exports = { 
//   canClaim, claimSalary, getRemainingTime, getBalance, 
//   canInvest, invest, getInvestRemainingTime,
//   canLuckBet, getLuckBetRemainingTime, luck100, getLeaderboard
// };


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: String,
  balance: { type: Number, default: 0 },
  lastClaim: { type: Number, default: 0 },
  lastInvest: { type: Number, default: 0 },
  lastLuckBet: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);

