// --- استدعاء المكتبات اللازمة ---
require('dotenv').config(); // لتحميل المتغيرات من ملف .env
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');

// --- إعدادات البوت وقاعدة البيانات ---
const token = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGO_URI;

// --- التحقق من وجود المتغيرات الأساسية ---
if (!token || !mongoUri) {
  console.error("خطأ: يرجى التأكد من تعريف BOT_TOKEN و MONGO_URI في ملف .env");
  process.exit(1);
}

// --- تهيئة البوت وربطه بالتوكن ---
// { polling: true } تجعل البوت يستقبل التحديثات بشكل مستمر من تليجرام
const bot = new TelegramBot(token, { polling: true });

// --- إعداد الاتصال بقاعدة البيانات ---
const client = new MongoClient(mongoUri);
let usersCollection;

// دالة للاتصال بقاعدة البيانات عند بدء تشغيل البوت
async function connectDB() {
  try {
    await client.connect();
    console.log("تم الاتصال بقاعدة البيانات بنجاح!");
    const db = client.db('telegram_bot_db'); // يمكنك تغيير اسم قاعدة البيانات
    usersCollection = db.collection('users'); // اسم الـ collection
  } catch (error) {
    console.error("فشل الاتصال بقاعدة البيانات:", error);
    process.exit(1); // إيقاف البوت في حال فشل الاتصال
  }
}

// --- قائمة المهن والرواتب العشوائية ---
const JOBS = {
    "مطور واجهات أمامية 💻": { min: 1500, max: 3000 },
    "مهندس برمجيات 🚀": { min: 2000, max: 4000 },
    "محلل بيانات 📊": { min: 1800, max: 3500 },
    "مدير منتجات 📈": { min: 2500, max: 5000 },
    "مصمم UI/UX 🎨": { min: 1700, max: 3200 },
    "مسؤول تسويق رقمي 📢": { min: 1200, max: 2500 },
};

// --- معالج الأمر /start ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name;

  // إعداد لوحة المفاتيح المخصصة
  const opts = {
    reply_markup: {
      keyboard: [['راتب 💰'], ['رصيدي 🏦']],
      resize_keyboard: true,
    },
  };

  const welcomeMessage = `أهلاً بك يا ${username} في بوت الرواتب!\n\nاضغط على زر **'راتب'** للحصول على راتبك.\nيمكنك طلب الراتب مرة كل دقيقة.`;

  bot.sendMessage(chatId, welcomeMessage, opts);
});

// --- معالج رسالة "راتب" ---
bot.onText(/راتب|راتب 💰/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const currentTime = new Date();

  try {
    // البحث عن المستخدم في قاعدة البيانات
    const userData = await usersCollection.findOne({ user_id: userId });

    // التحقق من المؤقت إذا كان المستخدم موجودًا
    if (userData && userData.last_claim) {
      const lastClaimTime = new Date(userData.last_claim);
      const timeDiff = (currentTime - lastClaimTime) / 1000; // الفرق بالثواني

      if (timeDiff < 60) {
        const remainingSeconds = Math.ceil(60 - timeDiff);
        bot.sendMessage(chatId, `⏳ المرجو الانتظار ${remainingSeconds} ثانية قبل طلب راتب آخر.`);
        return;
      }
    }

    // اختيار مهنة وراتب عشوائي
    const jobTitles = Object.keys(JOBS);
    const randomJob = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const { min, max } = JOBS[randomJob];
    const salary = Math.floor(Math.random() * (max - min + 1)) + min;

    // تحديث بيانات المستخدم (أو إنشاء سجل جديد له إذا لم يكن موجودًا)
    const result = await usersCollection.updateOne(
      { user_id: userId },
      {
        $inc: { balance: salary },
        $set: { last_claim: currentTime },
      },
      { upsert: true } // upsert: true تعني: إذا لم تجد المستخدم، قم بإنشائه
    );
    
    // جلب الرصيد المحدث
    const updatedUserData = await usersCollection.findOne({ user_id: userId });
    const newBalance = updatedUserData.balance;
    
    const replyMessage = `🎉 تهانينا! لقد عملت كـ **'${randomJob}'** وحصلت على راتب قدره **${salary}** ريال.\n\n🏦 رصيدك الحالي هو: **${newBalance}** ريال.`;
    bot.sendMessage(chatId, replyMessage);

  } catch (error) {
    console.error("حدث خطأ أثناء معالجة طلب الراتب:", error);
    bot.sendMessage(chatId, "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.");
  }
});


// --- معالج رسالة "رصيدي" ---
bot.onText(/رصيدي|رصيدي 🏦/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        const userData = await usersCollection.findOne({ user_id: userId });

        if (userData && userData.balance) {
            bot.sendMessage(chatId, `🏦 رصيدك الحالي هو: **${userData.balance}** ريال.`);
        } else {
            bot.sendMessage(chatId, "لم تقم باستلام أي راتب بعد. أرسل 'راتب' للبدء!");
        }
    } catch (error) {
        console.error("حدث خطأ أثناء عرض الرصيد:", error);
        bot.sendMessage(chatId, "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.");
    }
});


// --- بدء تشغيل كل شيء ---
// أولاً، الاتصال بقاعدة البيانات، ثم تشغيل البوت
console.log("البوت قيد التشغيل...");
connectDB();