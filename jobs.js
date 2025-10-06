const cron = require('node-cron');
const { addBalance, getUsers } = require('./services/users');

function startJobs(bot) {
  // وظيفة مجدولة: راتب يومي
  cron.schedule('0 0 * * *', async () => {
    const users = await getUsers();
    for (const user of users) {
      await addBalance(user.telegramId, 1000);
      bot.telegram.sendMessage(user.telegramId, '💰 تم إضافة راتبك اليومي 1000$');
    }
  });
}

module.exports = startJobs;
