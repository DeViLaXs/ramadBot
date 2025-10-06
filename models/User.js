const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  job: { type: String, default: null },
  lastSalary: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);
