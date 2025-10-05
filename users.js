const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");
const SALARY_COOLDOWN = 60 * 1000;       // 1 دقيقة
const INVEST_COOLDOWN = 10 * 60 * 1000;  // 10 دقائق
const LUCK_BET_COOLDOWN = 60 * 1000;     // 1 دقيقة

let users = {};

// تحميل البيانات
function loadUsers() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
      users = {};
    }
  }
}

// حفظ البيانات
function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// ======= الراتب =======
function canClaim(userId) {
  const user = users[userId];
  if (!user) return true;
  const now = Date.now();
  return now - (user.lastClaim || 0) >= SALARY_COOLDOWN;
}

function claimSalary(userId, job, name) {
  const now = Date.now();
  let user = users[userId] || { balance: 0, lastClaim: 0, lastInvest: 0, lastLuckBet: 0, name: name || "" };

  user.balance += job.salary;
  user.lastClaim = now;
  user.name = name || user.name;
  users[userId] = user;
  saveUsers();
  return user.balance;
}

function getRemainingTime(userId) {
  const user = users[userId];
  if (!user) return 0;
  const now = Date.now();
  const remaining = SALARY_COOLDOWN - (now - (user.lastClaim || 0));
  return remaining > 0 ? remaining : 0;
}

// ======= الاستثمار =======
function canInvest(userId) {
  const user = users[userId];
  if (!user) return true;
  const now = Date.now();
  return now - (user.lastInvest || 0) >= INVEST_COOLDOWN;
}

function invest(userId, name) {
  const now = Date.now();
  let user = users[userId] || { balance: 0, lastClaim: 0, lastInvest: 0, lastLuckBet: 0, name: name };

  if (user.balance <= 0) return { success: false, profit: 0, newBalance: user.balance };

  const percentage = Math.floor(Math.random() * 20) + 1; // 1% - 20%
  const profit = Math.floor(user.balance * (percentage / 100));

  user.balance += profit;
  user.lastInvest = now;
  user.name = name || user.name;
  users[userId] = user;
  saveUsers();

  return { success: true, profit, percentage, newBalance: user.balance };
}

function getInvestRemainingTime(userId) {
  const user = users[userId];
  if (!user) return 0;
  const now = Date.now();
  const remaining = INVEST_COOLDOWN - (now - (user.lastInvest || 0));
  return remaining > 0 ? remaining : 0;
}

// ======= الحظ بالرهان بنسبة 100% =======
function canLuckBet(userId) {
  const user = users[userId];
  if (!user) return true;
  const now = Date.now();
  return now - (user.lastLuckBet || 0) >= LUCK_BET_COOLDOWN;
}

function getLuckBetRemainingTime(userId) {
  const user = users[userId];
  if (!user) return 0;
  const now = Date.now();
  const remaining = LUCK_BET_COOLDOWN - (now - (user.lastLuckBet || 0));
  return remaining > 0 ? remaining : 0;
}

function luck100(userId, amount, name) {
  let user = users[userId];
  if (!user) return { success: false, msg: "🚫 لا يوجد رصيد لديك." };

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return { success: false, msg: "🚫 الرجاء إدخال مبلغ صحيح." };
  if (amount > user.balance) return { success: false, msg: "🚫 الرهان أكبر من رصيدك الحالي." };

  // نسبة متساوية: 50% فوز و50% خسارة
  const win = Math.random() < 0.5 ? true : false;

  const change = win ? amount : -amount;
  user.balance += change;
  user.lastLuckBet = Date.now();
  user.name = name || user.name;

  users[userId] = user;
  saveUsers();

  return {
    success: true,
    win,
    change,
    newBalance: user.balance
  };
}


// ======= الرصيد =======
function getBalance(userId) {
  const user = users[userId];
  return user ? user.balance : 0;
}

// ======= التصنيف =======
function getLeaderboard() {
  return Object.entries(users)
    .map(([id, data]) => ({ id, name: data.name || "مجهول", balance: data.balance }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);
}

loadUsers();

module.exports = { 
  canClaim, claimSalary, getRemainingTime, getBalance, 
  canInvest, invest, getInvestRemainingTime, getLeaderboard,
  canLuckBet, getLuckBetRemainingTime, luck100
};
