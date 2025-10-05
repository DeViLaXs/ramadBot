// const { Telegraf } = require("telegraf");
// const bot = new Telegraf("7247147386:AAG-t_5VhJv7iEBU1jmtfhTVrPYd2LYcSO4");

// // قائمة الكلمات والردود الثابتة
// const responses = {
//   "who is pretty?": "maram 😉",
//   "r u sure?":"Ofc",
//   "ramad":"Omar has crash on u, Do u know that ",
//   "من انت":"انا قطة شارع كنت جوعان ونطيت فوق سور بيت الناس وحصلت شخص قدامي اكلني ولعب معاي ",
//   "من هو؟":"عموري",
//   "is maram take pretty photos?":"who is maram?",
//   "how its look?":"amazing and pretty, who is she? 😍",
//   "she is my pretty":"Wow, what a luck u have 😉",
//   "i know":"😂",
//   "the pretty":"yeah ofc she is 💕",
//   "pretty":"only maram pretty",
//   "you like me?":"yes",
//   "r u flirt her?":"no",
//   "how much?":"like omar much",
//   "husband":"iam not ur ask omar",
//   "you divorced me?":"iam not to divorce",
//   "want":"ask omar",
//   "about?":"idk",
//   "want me?":"omar want",
//   "ur type?":"i dont have iam just cat",
//   "ur head?":"give her massage bro"
  


 
// };

// // يراقب أي رسالة نصية
// bot.on("text", (ctx) => {
//   const message = ctx.message.text.toLowerCase();
  
//   for (let word in responses) {
//     if (message.includes(word)) {
//       ctx.reply(responses[word], { reply_to_message_id: ctx.message.message_id });
//       break; // يرد مرة واحدة لكل رسالة
//     }
//   }
// });

// // تشغيل البوت
// bot.launch().then(() => console.log("Bot started"));

// index.js
