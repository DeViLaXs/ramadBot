// services/utils.js
const lastClaim = {};

function canClaim(telegramId) {
  const now = Date.now();
  if (!lastClaim[telegramId] || now - lastClaim[telegramId] > 24 * 60 * 60 * 1000) {
    lastClaim[telegramId] = now;
    return true;
  }
  return false;
}

module.exports = { canClaim };
