const { TelegramBot } = require('node-telegram-bot-api');
const { getRandomJob } = require("./jobs");
const { 
  canClaim, claimSalary, getRemainingTime, getBalance, 
  canInvest, invest, getInvestRemainingTime, getLeaderboard,
  canLuckBet, getLuckBetRemainingTime, luck100
} = require("./users");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token,{polling:true});

// رسالة البداية
bot.start((ctx) => {
  ctx.reply(
    "👋 أهلاً بك!\n\n" +
    "📝 الأوامر المتاحة:\n" +
    "💰 'راتب'\n" +
    "📊 'رصيد'\n" +
    "📈 'استثمار'\n" +
    "🍀 'حظ <المبلغ>'\n" +
    "🏆 'تصنيف'",
    { reply_to_message_id: ctx.message.message_id }
  );
});

// ======= واجهة استعلامات =======
bot.hears(/^(اوامر)$/i, (ctx) => {
  ctx.reply(
    `📋 *الأوامر المتاحة:*\n\n` +
    `💰 'راتب' - للحصول على راتب \n` +
    `📊 'رصيد' - لمعرفة رصيدك الحالي\n` +
    `📈 'استثمار' - لاستثمار رصيدك بنسبة 1-20%\n` +
    `🍀 'حظ المبلغ' - تجربة الحظ بالرهان  \n` +
    `🏆 'تصنيف' - أفضل 10 لاعبين حسب الرصيد\n` +
    `❓ 'اوامر' - لعرض قائمة الأوامر\n`,
    { parse_mode: "Markdown", reply_to_message_id: ctx.message.message_id }
  );
});


// ======= راتب =======
bot.hears("راتب", (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;

  if (!canClaim(userId)) {
    const ms = getRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(`⏳ انتظر ${min} دقيقة و${sec} ثانية قبل طلب راتب جديد`, { reply_to_message_id: ctx.message.message_id });
  }

  const job = getRandomJob();
  const balance = claimSalary(userId, job, userName);

  ctx.reply(`💼 الوظيفة: ${job.title}\n💵 الراتب: ${job.salary} ريال\n🪙 رصيدك: ${balance} ريال`, { reply_to_message_id: ctx.message.message_id });
});

// ======= رصيد =======
bot.hears("رصيد", (ctx) => {
  const userId = ctx.from.id;
  const balance = getBalance(userId);
  ctx.reply(`🪙 رصيدك الحالي: ${balance} ريال`, { reply_to_message_id: ctx.message.message_id });
});

// ======= استثمار =======
bot.hears("استثمار", (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;

  if (!canInvest(userId)) {
    const ms = getInvestRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(`⏳ انتظر ${min} دقيقة و${sec} ثانية قبل الاستثمار مرة أخرى`, { reply_to_message_id: ctx.message.message_id });
  }

  const result = invest(userId, userName);
  if (!result.success) return ctx.reply("🚫 رصيدك غير كافي للاستثمار.", { reply_to_message_id: ctx.message.message_id });

  ctx.reply(`📈 استثمار ناجح!\n💹 النسبة: ${result.percentage}%\n💵 الأرباح: ${result.profit} ريال\n🪙 رصيدك الجديد: ${result.newBalance} ريال`, { reply_to_message_id: ctx.message.message_id });
});

// ======= حظ بالرهان =======
bot.hears(/حظ(?:\s+(\d+))?/, (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name;
  const amount = ctx.match[1];

  // إذا لم يضع المستخدم المبلغ
  if (!amount) {
    return ctx.reply(
      "🚫 الرجاء كتابة المبلغ بعد كلمة حظ.\nمثال: حظ 500",
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  if (!canLuckBet(userId)) {
    const ms = getLuckBetRemainingTime(userId);
    const min = Math.floor(ms / 60000);
    const sec = Math.ceil((ms / 1000) % 60);
    return ctx.reply(
      `⏳ انتظر ${min} دقيقة و${sec} ثانية قبل تجربة الحظ مرة أخرى`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  const result = luck100(userId, amount, userName);
  if (!result.success) return ctx.reply(result.msg, { reply_to_message_id: ctx.message.message_id });

  const status = result.win ? "🎉 فزت!" : "💔 خسرت!";
  const change = result.win ? `+${result.change}` : `${result.change}`;

  ctx.reply(
    `🍀 حظك بالرهان!\n💵 المبلغ: ${amount} ريال\n${status} (${change} ريال)\n🪙 رصيدك الجديد: ${result.newBalance} ريال`,
    { reply_to_message_id: ctx.message.message_id }
  );
});


// ======= تصنيف =======
bot.hears("تصنيف", (ctx) => {
  const top = getLeaderboard();
  if (top.length === 0) return ctx.reply("🚫 لا يوجد لاعبين حالياً.", { reply_to_message_id: ctx.message.message_id });

  let message = "🏆 أفضل 10 لاعبين:\n";
  top.forEach((u, i) => {
    message += `${i + 1}. 👤 ${u.name} — 🪙 ${u.balance} ريال\n`;
  });

  ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
});

// تشغيل البوت
bot.launch();
console.log("🤖 البوت شغال...");
