const jobs = [
  { title: "💻 مهندس برمجيات", salary: 5000 },
  { title: "🖥️ مطور ويب", salary: 3500 },
  { title: "📊 محلل بيانات", salary: 4000 },
  { title: "🛡️ خبير أمن سيبراني", salary: 6000 },
  { title: "📈 مدير مشروع", salary: 7000 },
  { title: "📝 محاسب", salary: 3000 },
  { title: "🛒 مندوب مبيعات", salary: 2500 },
  { title: "👨‍🏫 مدرس لغة عربية", salary: 2000 },
  { title: "📚 مدرس رياضيات", salary: 2000 },
  { title: "🧑‍⚕️ طبيب عام", salary: 6000 },
  { title: "💊 صيدلي", salary: 20000 },
  { title: "🩺 ممرض", salary: 2500 },
  { title: "🎨 مصمم جرافيك", salary: 3000 },
  { title: "🧑‍🌾 مزارع", salary: 1800 },
  { title: "👷‍♂️ مهندس مدني", salary: 3500 },
  { title: "🔌 مهندس كهرباء", salary: 3400 },
  { title: "🚗 سائق", salary: 1800 },
  { title: "🍳 طباخ", salary: 1500 },
  { title: "🧹 عامل نظافة", salary: 1200 },
  { title: "🧵 خياط", salary: 1300 }
];

function getRandomJob() {
  return jobs[Math.floor(Math.random() * jobs.length)];
}

module.exports = { jobs, getRandomJob };
