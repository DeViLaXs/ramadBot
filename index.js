require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const { findOrCreateUser, addBalance, setJob, getUsers } = require('./services/users');
const { canClaim } = require('./services/utils');


const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// 📌 اتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// 📌 أوامر البوت
bot.start(async (ctx) => {
  await findOrCreateUser(ctx.from.id);
  ctx.reply("👋 أهلاً بك! استخدم /help لمعرفة الأوامر.");
});

bot.command('help', (ctx) => {
  ctx.reply("📌 الأوامر المتاحة:\n/راتب - استلام راتب\n/رصيد - عرض رصيدك\n/وظيفة - اختيار وظيفة\n/تصنيف - عرض ترتيب اللاعبين");
});

// 💵 راتب
bot.command('راتب', async (ctx) => {
  const user = await findOrCreateUser(ctx.from.id);
  if (canClaim(ctx.from.id)) {
    await addBalance(ctx.from.id, 500);
    ctx.reply(`💵 تم إضافة 500$ لرصيدك. الرصيد الحالي: ${user.balance + 500}$`);
  } else {
    ctx.reply("⏰ لقد استلمت راتبك بالفعل اليوم، حاول لاحقاً.");
  }
});

// 💰 رصيد
bot.command('رصيد', async (ctx) => {
  const user = await findOrCreateUser(ctx.from.id);
  ctx.reply(`💰 رصيدك الحالي: ${user.balance}$`);
});

// 🛠️ وظيفة
bot.command('وظيفة', async (ctx) => {
  const user = await setJob(ctx.from.id, "مبرمج");
  ctx.reply(`🛠️ وظيفتك الحالية: ${user.job}`);
});

// 🏆 تصنيف
bot.command('تصنيف', async (ctx) => {
  const users = await getUsers();
  let message = "🏆 قائمة الأغنياء:\n\n";
  users.slice(0, 5).forEach((u, i) => {
    message += `${i+1}. ${u.telegramId} - ${u.balance}$\n`;
  });
  ctx.reply(message);
});

// 📌 Webhook لـ Render
app.use(bot.webhookCallback('/webhook'));
bot.telegram.setWebhook(`${process.env.RENDER_EXTERNAL_URL}/webhook`);

app.get('/', (req, res) => res.send('Bot is running 🚀'));

// 📌 تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
