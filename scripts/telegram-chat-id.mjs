// Показує id чатів, з якими бот вже «спілкувався» — щоб взяти TELEGRAM_CHAT_ID.
// Запуск: node --env-file=.env.local scripts/telegram-chat-id.mjs
// Токен нікуди не виводиться.

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Немає TELEGRAM_BOT_TOKEN. Впишіть токен у .env.local і запустіть ще раз.");
  process.exit(1);
}

const api = (method) => fetch(`https://api.telegram.org/bot${token}/${method}`).then((r) => r.json());

const me = await api("getMe");
if (!me.ok) {
  console.error("Telegram відхилив токен:", me.description);
  process.exit(1);
}
console.log(`Бот: @${me.result.username}\n`);

const updates = await api("getUpdates");
if (!updates.ok) {
  console.error("getUpdates:", updates.description);
  process.exit(1);
}

const chats = new Map();
for (const u of updates.result) {
  const chat = (u.message ?? u.edited_message ?? u.channel_post ?? u.my_chat_member)?.chat;
  if (chat) chats.set(chat.id, chat);
}

if (chats.size === 0) {
  console.log("Чатів поки немає. Додайте бота в групу кафе, напишіть у групі /start і запустіть скрипт ще раз.");
} else {
  for (const c of chats.values()) {
    const title = c.title ?? [c.first_name, c.last_name].filter(Boolean).join(" ");
    console.log(`${c.type.padEnd(11)} ${String(c.id).padEnd(16)} ${title}`);
  }
  console.log("\nЗначення з групи (type=group/supergroup, id зазвичай починається з -) вставте в TELEGRAM_CHAT_ID.");
}
