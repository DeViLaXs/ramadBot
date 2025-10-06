// index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const connectDB = require("./db");
const { getRandomJob } = require("./jobs");
const {
  canClaim, claimSalary, getRemainingTime, getBalance,
  canInvest, invest, getInvestRemainingTime, getLeaderboard,
  canLuckBet, getLuckBetRemainingTime, luck100
} = require("./users");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ======= Webhook =======
app.use(bot.webhookCallback('/webhook'));
const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
connectDB();

// ======= الأوامر =======
bot.hears(/^(اوامر|help)$/i, (ctx) => {
  ctx.reply(
    `📋 *الأوامر المتاحة:*\n\n` +
    `💰 'راتب' - للحصول على راتب عشوائي\n` +
    `📊 'رصيد' - لمعرفة رصيدك الحالي\n` +
    `📈 'استثمار' - لاستثمار رصيدك بنسبة 1-20%\n` +
    `🍀 'حظ <المبلغ>' - تجربة الحظ بالرهان بنسبة %\n` +
    `🏆 'تصنيف' - أفضل 10 لاعبين حسب الرصيد\n` +
    `❓ 'أوامر' أو 'help' - لعرض قائمة الأوامر\n`,
    { parse_mode: "Markdown" }
  );
});

// ======= راتب =======
bot.hears("راتب", async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;

  if (!(await canClaim(userId))) {
    const ms = await getRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(`⏳ انتظر ${min} دقيقة و${sec} ثانية قبل طلب راتب جديد`);
  }

  const job = getRandomJob();
  const balance = await claimSalary(userId, job, userName);

  ctx.reply(`💼 الوظيفة: ${job.title}\n💵 الراتب: ${job.salary} ريال\n🪙 رصيدك: ${balance} ريال`);
});

// ======= رصيد =======
bot.hears("رصيد", async (ctx) => {
  const balance = await getBalance(ctx.from.id);
  ctx.reply(`🪙 رصيدك الحالي: ${balance} ريال`);
});

// ======= استثمار =======
bot.hears("استثمار", async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;

  if (!(await canInvest(userId))) {
    const ms = await getInvestRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(`⏳ انتظر ${min} دقيقة و${sec} ثانية قبل الاستثمار مرة أخرى`);
  }

  const result = await invest(userId, userName);
  if (!result.success) return ctx.reply("🚫 رصيدك غير كافي للاستثمار.");

  ctx.reply(`📈 استثمار ناجح!\n💹 النسبة: ${result.percentage}%\n💵 الأرباح: ${result.profit} ريال\n🪙 رصيدك الجديد: ${result.newBalance} ريال`);
});

// ======= حظ =======
bot.hears(/حظ(?:\s+(\d+))?/, async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;
  const amount = ctx.match[1];
  if (!amount) return ctx.reply("🚫 الرجاء كتابة المبلغ بعد كلمة حظ.\nمثال: حظ 500");

  if (!(await canLuckBet(userId))) {
    const ms = await getLuckBetRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(`⏳ انتظر ${min} دقيقة و${sec} ثانية قبل تجربة الحظ مرة أخرى`);
  }

  const result = await luck100(userId, amount, userName);
  if (!result.success) return ctx.reply(result.msg);

  const status = result.win ? "🎉 فزت!" : "💔 خسرت!";
  const change = result.win ? `+${result.change}` : `${result.change}`;

  ctx.reply(`🍀 حظك بالرهان!\n💵 المبلغ: ${amount} ريال\n${status} (${change} ريال)\n🪙 رصيدك الجديد: ${result.newBalance} ريال`);
});

// ======= تصنيف =======
bot.hears("تصنيف", async (ctx) => {
  const top = await getLeaderboard();
  if (!top.length) return ctx.reply("🚫 لا يوجد لاعبين حالياً.");

  let message = "🏆 أفضل 10 لاعبين:\n";
  top.forEach((u, i) => message += `${i + 1}. 👤 ${u.name} — 🪙 ${u.balance} ريال\n`);
  ctx.reply(message);
});

// ======= تشغيل السيرفر =======
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await bot.telegram.setWebhook(`${process.env.RENDER_EXTERNAL_URL}/webhook`);
});
