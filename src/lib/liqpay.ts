import { createHash } from "node:crypto";

// Документація: https://www.liqpay.ua/documentation/api/callback
// Ключі — sandbox_* під час тестів, потім заміняться на бойові (той самий формат).

function sign(privateKey: string, data: string): string {
  return createHash("sha1").update(privateKey + data + privateKey).digest("base64");
}

export function buildCheckout(params: {
  publicKey: string;
  privateKey: string;
  orderNumber: string;
  amount: number;
  description: string;
  resultUrl: string;
  serverUrl: string;
}) {
  const payload = {
    version: 3,
    public_key: params.publicKey,
    action: "pay",
    amount: params.amount,
    currency: "UAH",
    description: params.description,
    order_id: params.orderNumber,
    result_url: params.resultUrl,
    server_url: params.serverUrl,
    language: "uk",
    // Способи оплати на сторінці LiqPay. Apple Pay показується лише на пристроях Apple,
    // Google Pay — в Chrome/Android; картка й Приват24 — для всіх інших.
    paytypes: "apay,gpay,card,privat24",
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const signature = sign(params.privateKey, data);
  return { data, signature };
}

export type LiqpayCallback = {
  order_id: string;
  status: string;
  amount: number;
  currency: string;
};

/** Повертає розпарсений data, якщо підпис вірний, інакше null (значить, запит не від LiqPay). */
export function verifyCallback(privateKey: string, data: string, signature: string): LiqpayCallback | null {
  if (sign(privateKey, data) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64").toString("utf8")) as LiqpayCallback;
  } catch {
    return null;
  }
}

// Статуси: https://www.liqpay.ua/uk/doc/api/callback
// "success" — звичайна оплата, "sandbox" — тестова (ключі sandbox_*).
// "wait_accept" / "wait_compensation" — гроші з клієнта вже списані (зарахування
// магазину відкладене), тож замовлення треба готувати.
export const PAID_STATUSES = new Set(["success", "sandbox", "wait_accept", "wait_compensation"]);

// Остаточна невдача. Усі інші статуси (processing, 3ds_verify, wait_secure, ...) —
// проміжні: після них LiqPay ще надішле фінальний callback, тож нічого не міняємо.
export const FAILED_STATUSES = new Set(["failure", "error", "reversed"]);
