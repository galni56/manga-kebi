import { getMenu } from "@/lib/menu-source";
import { FAILED_STATUSES, PAID_STATUSES, verifyCallback } from "@/lib/liqpay";
import { claimPendingPayment, markPaymentFailed } from "@/lib/orders-db";
import { buildOrderMessage, sendOrderToTelegram } from "@/lib/telegram";

// LiqPay стукає сюди сервер-до-сервера (не з браузера клієнта) одразу після оплати —
// саме тут, а не на result_url (куди просто повертає браузер), можна довіряти статусу.
export async function POST(request: Request) {
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!privateKey) return new Response("LiqPay не налаштований", { status: 503 });

  const form = await request.formData();
  const data = String(form.get("data") ?? "");
  const signature = String(form.get("signature") ?? "");

  const callback = verifyCallback(privateKey, data, signature);
  if (!callback) {
    console.error("LiqPay callback: невірний підпис");
    return new Response("bad signature", { status: 400 });
  }

  const orderNumber = callback.order_id;

  if (FAILED_STATUSES.has(callback.status)) {
    console.log(`LiqPay: замовлення №${orderNumber} не оплачено (status=${callback.status})`);
    markPaymentFailed(orderNumber);
    return new Response("ok");
  }

  if (!PAID_STATUSES.has(callback.status)) {
    // Проміжний статус — чекаємо наступного callback з фінальним.
    console.log(`LiqPay: замовлення №${orderNumber} в процесі (status=${callback.status})`);
    return new Response("ok");
  }

  // claimPendingPayment сама захищає від повторної обробки того самого вебхука
  // (LiqPay іноді шле callback декілька разів) — повертає payload лише один раз.
  const pending = claimPendingPayment(orderNumber);
  if (!pending) {
    console.log(`LiqPay: замовлення №${orderNumber} вже оброблене або не знайдене`);
    return new Response("ok");
  }

  const { products, delivery } = await getMenu();
  const productById = new Map(products.map((p) => [p.id, p]));

  try {
    await sendOrderToTelegram(buildOrderMessage(pending.payload, orderNumber, productById, delivery, { paidOnline: true }), orderNumber);
  } catch (e) {
    console.error(`Не вдалося надіслати оплачене замовлення №${orderNumber} в Telegram`, e);
    // Клієнт уже оплатив — гроші не пропадуть (запис у базі вже позначено як
    // 'placed' в claimPendingPayment), але кухня замовлення не побачить.
    // Дзвінок від клієнта (якщо він напише в підтримку) — єдина підстраховка тут.
    return new Response("telegram failed", { status: 502 });
  }

  return new Response("ok");
}
