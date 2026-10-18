import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/data/menu";
import type { OrderPayload } from "@/lib/order";

// SQLite-файл для щоденної аналітики (кількість замовлень, виручка, топ-страви)
// і для замовлень з онлайн-оплатою (чекаємо підтвердження від LiqPay, перш ніж
// слати в Telegram). НЕ в git і НЕ в деплой-архіві (дивись .gitignore і скрипт
// деплою) — інакше кожен деплой перезаписував би цю базу порожньою локальною копією.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "orders.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS orders (
    order_number TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    delivery INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'placed',
    payload_json TEXT
  );
`;

function withDb<T>(fn: (db: InstanceType<typeof DatabaseSync>) => T): T {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  try {
    db.exec(SCHEMA);
    // CREATE TABLE IF NOT EXISTS не додає нових колонок у вже існуючу таблицю
    // (стару базу могли створити telegram-worker / daily-report без payload_json).
    const columns = db.prepare("PRAGMA table_info(orders)").all() as { name: string }[];
    if (!columns.some((c) => c.name === "payload_json")) {
      db.exec("ALTER TABLE orders ADD COLUMN payload_json TEXT");
    }
    return fn(db);
  } finally {
    db.close();
  }
}

function itemsForDb(o: OrderPayload, productById: Map<string, Product>) {
  return o.items.map((it) => {
    const p = productById.get(it.id);
    return { name: p?.name ?? it.id, qty: it.qty, price: p?.price ?? 0 };
  });
}

/** Викликається одразу після успішної відправки замовлення в Telegram (готівка). */
export function saveOrder(
  orderNumber: string,
  o: OrderPayload,
  productById: Map<string, Product>,
  totals: { subtotal: number; delivery: number; total: number },
) {
  withDb((db) => {
    db.prepare(
      `INSERT INTO orders (order_number, created_at, items_json, subtotal, delivery, total, status)
       VALUES (?, ?, ?, ?, ?, ?, 'placed')`,
    ).run(orderNumber, new Date().toISOString(), JSON.stringify(itemsForDb(o, productById)), totals.subtotal, totals.delivery, totals.total);
  });
}

/** Перед редіректом на LiqPay — зберігаємо повний payload, щоб зібрати повідомлення в Telegram після оплати. */
export function savePendingPayment(
  orderNumber: string,
  o: OrderPayload,
  productById: Map<string, Product>,
  totals: { subtotal: number; delivery: number; total: number },
) {
  withDb((db) => {
    db.prepare(
      `INSERT INTO orders (order_number, created_at, items_json, subtotal, delivery, total, status, payload_json)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_payment', ?)`,
    ).run(
      orderNumber,
      new Date().toISOString(),
      JSON.stringify(itemsForDb(o, productById)),
      totals.subtotal,
      totals.delivery,
      totals.total,
      JSON.stringify(o),
    );
  });
}

export type PendingOrder = { orderNumber: string; payload: OrderPayload };

/** Викликається з LiqPay-вебхука. Повертає збережений payload лише якщо замовлення
 * ще не оброблене (захист від повторної відправки того самого вебхука в Telegram).
 * payment_failed теж підходить: клієнт міг повторити оплату на сторінці LiqPay. */
export function claimPendingPayment(orderNumber: string): PendingOrder | null {
  return withDb((db) => {
    const row = db
      .prepare("SELECT payload_json FROM orders WHERE order_number = ? AND status IN ('pending_payment', 'payment_failed')")
      .get(orderNumber) as { payload_json: string } | undefined;
    if (!row) return null;
    db.prepare("UPDATE orders SET status = 'placed' WHERE order_number = ?").run(orderNumber);
    return { orderNumber, payload: JSON.parse(row.payload_json) as OrderPayload };
  });
}

/** Для сторінки /order/success: статус замовлення або null, якщо такого немає. */
export function getOrderStatus(orderNumber: string): string | null {
  return withDb((db) => {
    const row = db.prepare("SELECT status FROM orders WHERE order_number = ?").get(orderNumber) as { status: string } | undefined;
    return row?.status ?? null;
  });
}

export function markPaymentFailed(orderNumber: string) {
  withDb((db) => {
    db.prepare("UPDATE orders SET status = 'payment_failed' WHERE order_number = ? AND status = 'pending_payment'").run(orderNumber);
  });
}
