// Обробляє натискання кнопок "Взяти в роботу" / "Нагадати за 10 хв" / "Скасувати" під замовленнями
// в Telegram-групі. Сайт (src/app/api/order/route.ts) лише надсилає повідомлення з
// кнопками; натискання кнопок Telegram довозить сюди — окремим процесом, бо на цей
// момент сайт живе на localhost, а Telegram не вміє стукати на localhost напряму
// (webhook потребує публічний HTTPS-домен). Коли сайт буде задеплоєний, це можна
// замінити на /api/telegram/webhook — сам розбір кнопок (нижче) залишиться тим самим.
//
// Запуск (окремий, постійно відкритий термінал, паралельно з `npm run dev`):
//   node --env-file=.env.local scripts/telegram-worker.mjs
//
// Обмеження: стан "хто взяв" і таймери нагадувань живуть лише в пам'яті цього процесу.
// Перезапуск скрипта забуває, що вже взято в роботу (не критично — просто хтось може
// натиснути "Взяти в роботу" ще раз) і скасовує ще не спрацьовані нагадування.

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const REMIND_MINUTES = 10;

// Та сама база, що й src/lib/orders-db.ts (тут — окрема мінімальна копія, бо цей
// скрипт запускається звичайним node, а не через Next.js). Тут лише позначаємо
// замовлення скасованим — запис створює сайт при відправці в Telegram.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "orders.db");

function markCancelledInDb(orderNumber) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          order_number TEXT PRIMARY KEY, created_at TEXT NOT NULL, items_json TEXT NOT NULL,
          subtotal INTEGER NOT NULL, delivery INTEGER NOT NULL, total INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'placed'
        );
      `);
      db.prepare("UPDATE orders SET status = 'cancelled' WHERE order_number = ?").run(orderNumber);
    } finally {
      db.close();
    }
  } catch (e) {
    console.error("Не вдалося позначити замовлення скасованим у базі:", e);
  }
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Немає TELEGRAM_BOT_TOKEN у .env.local");
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

// Bot API не приймає tel: у кнопках (лише http(s) і tg://) — тому кнопки для дзвінка
// немає, номер у тексті замовлення сам стає клікабельним (сайт пише його як +380...).
function orderKeyboard(orderNumber) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Взяти в роботу", callback_data: `take:${orderNumber}` },
        { text: `⏰ Нагадати за ${REMIND_MINUTES} хв`, callback_data: `remind:${orderNumber}` },
      ],
      [{ text: "❌ Скасувати", callback_data: `cancel:${orderNumber}` }],
    ],
  };
}

const displayName = (from) =>
  [from.first_name, from.last_name].filter(Boolean).join(" ") || (from.username ? `@${from.username}` : "хтось");

// orderNumber -> { claimedBy: string|null, cancelledBy: string|null, reminders: Set<Timeout> }
const orders = new Map();
function orderState(orderNumber) {
  if (!orders.has(orderNumber)) orders.set(orderNumber, { claimedBy: null, cancelledBy: null, reminders: new Set() });
  return orders.get(orderNumber);
}

async function handleCallback(cb) {
  const [action, orderNumber] = (cb.data ?? "").split(":");
  const chatId = cb.message?.chat?.id;
  const messageId = cb.message?.message_id;
  if (!action || !orderNumber || !chatId || !messageId) {
    await api("answerCallbackQuery", { callback_query_id: cb.id });
    return;
  }
  const state = orderState(orderNumber);
  const who = displayName(cb.from);

  if (state.cancelledBy) {
    await api("answerCallbackQuery", { callback_query_id: cb.id, text: `Замовлення вже скасовано (${state.cancelledBy})`, show_alert: true });
    return;
  }

  if (action === "take") {
    if (state.claimedBy) {
      await api("answerCallbackQuery", { callback_query_id: cb.id, text: `Вже взяв(ла): ${state.claimedBy}`, show_alert: true });
      return;
    }
    state.claimedBy = who;
    state.reminders.forEach(clearTimeout);
    state.reminders.clear();

    await api("answerCallbackQuery", { callback_query_id: cb.id, text: "Прийнято!" });
    // Прибираємо кнопки з оригінального повідомлення (текст не чіпаємо — там HTML-розмітка сума/склад).
    await api("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } });
    await api("sendMessage", {
      chat_id: chatId,
      text: `✅ ${who} взяв(ла) замовлення №${orderNumber} в роботу.`,
      reply_parameters: { message_id: messageId },
    });
    console.log(`[${new Date().toLocaleTimeString("uk-UA")}] №${orderNumber} взяв(ла) ${who}`);
    return;
  }

  if (action === "remind") {
    if (state.reminders.size > 0) {
      await api("answerCallbackQuery", { callback_query_id: cb.id, text: "Нагадування вже поставлено — чекайте", show_alert: true });
      return;
    }
    const remindAtLabel = new Date(Date.now() + REMIND_MINUTES * 60_000).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Kyiv",
    });
    await api("answerCallbackQuery", { callback_query_id: cb.id, text: `Нагадаю за ${REMIND_MINUTES} хв` });
    // Видима позначка для всієї групи — інакше нагадування бачить тільки той, хто натиснув.
    await api("sendMessage", {
      chat_id: chatId,
      text: `⏰ ${who} поставив(ла) нагадування на замовлення №${orderNumber} — нагадаю о ${remindAtLabel}, якщо ще не візьмуть у роботу.`,
      reply_parameters: { message_id: messageId },
    });
    console.log(`[${new Date().toLocaleTimeString("uk-UA")}] №${orderNumber}: нагадування поставив(ла) ${who}, спрацює о ${remindAtLabel}`);
    const timer = setTimeout(async () => {
      state.reminders.delete(timer);
      if (state.claimedBy || state.cancelledBy) return; // вже взяли або скасували — нагадувати нема сенсу
      await api("sendMessage", {
        chat_id: chatId,
        text: `⏰ Нагадування: замовлення №${orderNumber} ще ніхто не взяв у роботу!`,
        reply_parameters: { message_id: messageId },
        reply_markup: orderKeyboard(orderNumber),
      });
      console.log(`[${new Date().toLocaleTimeString("uk-UA")}] №${orderNumber}: нагадування надіслано`);
    }, REMIND_MINUTES * 60_000);
    state.reminders.add(timer);
    return;
  }

  if (action === "cancel") {
    state.cancelledBy = who;
    state.reminders.forEach(clearTimeout);
    state.reminders.clear();
    markCancelledInDb(orderNumber);

    await api("answerCallbackQuery", { callback_query_id: cb.id, text: "Скасовано" });
    await api("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } });
    await api("sendMessage", {
      chat_id: chatId,
      text: `❌ ${who} скасував(ла) замовлення №${orderNumber}.`,
      reply_parameters: { message_id: messageId },
    });
    console.log(`[${new Date().toLocaleTimeString("uk-UA")}] №${orderNumber} скасував(ла) ${who}`);
    return;
  }

  await api("answerCallbackQuery", { callback_query_id: cb.id });
}

async function main() {
  const me = await api("getMe");
  if (!me.ok) {
    console.error("Telegram відхилив токен:", me.description);
    process.exit(1);
  }
  console.log(`Воркер запущено для @${me.result.username}. Натискання кнопок обробляються тут. Ctrl+C — зупинити.`);

  let offset = 0;
  for (;;) {
    let updates;
    try {
      updates = await api("getUpdates", { offset, timeout: 50, allowed_updates: ["callback_query"] });
    } catch (e) {
      console.error("Мережева помилка, повторюю за 3с:", e.message);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    if (!updates.ok) {
      console.error("getUpdates:", updates.description);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    for (const u of updates.result) {
      offset = u.update_id + 1;
      if (u.callback_query) {
        handleCallback(u.callback_query).catch((e) => console.error("Помилка обробки натискання:", e));
      }
    }
  }
}

main();
