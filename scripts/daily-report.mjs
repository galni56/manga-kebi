// Щоденний підсумок замовлень — скільки було, на яку суму, топ-страви.
// Читає ту саму базу, куди сайт пише замовлення (src/lib/orders-db.ts), і шле
// зведення в ту саму Telegram-групу, що й самі замовлення.
//
// Запуск вручну (перевірка): node --env-file=.env.local scripts/daily-report.mjs
// За розкладом — через cron (дивись README нижче), сервер переведений на Europe/Kyiv,
// тож "0 5 20 * * *" в crontab означає рівно 20:05 за київським часом цілий рік.

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "orders.db");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
  console.error("Немає TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID у .env.local");
  process.exit(1);
}

function todayBoundsIso() {
  // Сервер у Europe/Kyiv, тож локальна північ Date-об'єкта = київська північ.
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return { startIso: start.toISOString(), nowIso: now.toISOString() };
}

function buildReport() {
  const db = new DatabaseSync(DB_PATH);
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        order_number TEXT PRIMARY KEY, created_at TEXT NOT NULL, items_json TEXT NOT NULL,
        subtotal INTEGER NOT NULL, delivery INTEGER NOT NULL, total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'placed'
      );
    `);
    const { startIso, nowIso } = todayBoundsIso();
    const rows = db.prepare("SELECT * FROM orders WHERE created_at >= ? AND created_at <= ?").all(startIso, nowIso);

    // pending_payment / payment_failed — це незавершені спроби онлайн-оплати
    // (клієнт пішов на LiqPay і не оплатив), реальними замовленнями не рахуємо.
    const cancelled = rows.filter((r) => r.status === "cancelled");
    const placed = rows.filter((r) => r.status === "placed");
    const revenue = placed.reduce((s, r) => s + r.total, 0);

    const itemCounts = new Map();
    for (const r of placed) {
      for (const it of JSON.parse(r.items_json)) {
        itemCounts.set(it.name, (itemCounts.get(it.name) ?? 0) + it.qty);
      }
    }
    const top = [...itemCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const dateLabel = new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
    const lines = [
      `📊 <b>Підсумок за ${dateLabel}</b>`,
      "",
      `Замовлень: ${placed.length + cancelled.length}${cancelled.length ? ` (скасовано: ${cancelled.length})` : ""}`,
      `Виручка: ${revenue} грн`,
    ];
    if (top.length) {
      lines.push("", "Топ страв:");
      top.forEach(([name, qty], i) => lines.push(`${i + 1}. ${name} — ${qty} шт.`));
    } else {
      lines.push("", "Замовлень сьогодні не було.");
    }
    return lines.join("\n");
  } finally {
    db.close();
  }
}

async function sendReport(text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}

const report = buildReport();
console.log(report.replace(/<[^>]+>/g, ""));
await sendReport(report);
console.log("Надіслано.");
