import type { Product } from "@/data/menu";
import { calcTotals, paymentLabels, toTelHref, type DeliverySettings, type OrderPayload } from "@/lib/order";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildOrderMessage(
  o: OrderPayload,
  orderNumber: string,
  productById: Map<string, Product>,
  deliverySettings: DeliverySettings,
  options: { paidOnline?: boolean } = {},
) {
  const { subtotal, delivery, total } = calcTotals(o.items, productById, deliverySettings);
  const lines = o.items.map((it) => {
    const p = productById.get(it.id)!;
    return `• ${esc(p.name)} × ${it.qty} — ${p.price * it.qty} грн`;
  });
  return [
    `🆕 <b>Замовлення №${orderNumber}</b>`,
    "",
    ...lines,
    "",
    `Страви: ${subtotal} грн`,
    `Доставка: ${delivery} грн`,
    `<b>Разом: ${total} грн</b>`,
    options.paidOnline ? "💳 <b>Оплачено онлайн</b>" : `Оплата: ${paymentLabels[o.payment]}`,
    "",
    `👤 ${esc(o.name.trim())}`,
    // Повний міжнародний формат (+380...), щоб Telegram сам підкреслив номер як дзвінок —
    // кнопку з tel: Bot API не приймає (лише http(s) і tg://), тому номер сам "кнопка".
    `📞 ${esc(toTelHref(o.phone).replace("tel:", ""))}`,
    `📍 ${esc(o.street)}, буд. ${esc(o.house.trim())}, під'їзд ${esc(o.entrance.trim() || "—")}, поверх ${esc(o.floor.trim() || "—")}, кв. ${esc(o.apartment.trim())}`,
    o.comment.trim() ? `💬 ${esc(o.comment.trim())}` : "",
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");
}

// Кнопки під замовленням у Telegram. callback_data кодує дію й номер замовлення —
// їх розбирає scripts/telegram-worker.mjs (окремий процес, дивись README там).
export function orderKeyboard(orderNumber: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Взяти в роботу", callback_data: `take:${orderNumber}` },
        { text: "⏰ Нагадати за 10 хв", callback_data: `remind:${orderNumber}` },
      ],
      [{ text: "❌ Скасувати", callback_data: `cancel:${orderNumber}` }],
    ],
  };
}

export async function sendOrderToTelegram(text: string, orderNumber: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    if (process.env.NODE_ENV === "production") throw new Error("Telegram не налаштований");
    console.log("[order:dev, Telegram не налаштований]\n" + text.replace(/<[^>]+>/g, ""));
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: orderKeyboard(orderNumber) }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}
