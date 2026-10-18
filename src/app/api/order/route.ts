import { cafe } from "@/data/config";
import { isOpenNow } from "@/lib/hours";
import { getMenu } from "@/lib/menu-source";
import { calcTotals, validateOrder, type OrderPayload } from "@/lib/order";
import { saveOrder } from "@/lib/orders-db";
import { buildOrderMessage, sendOrderToTelegram } from "@/lib/telegram";

export async function POST(request: Request) {
  let body: OrderPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некоректний запит" }, { status: 400 });
  }

  const payload: OrderPayload = {
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    street: String(body.street ?? ""),
    house: String(body.house ?? ""),
    entrance: String(body.entrance ?? ""),
    floor: String(body.floor ?? ""),
    apartment: String(body.apartment ?? ""),
    comment: String(body.comment ?? "").slice(0, 500),
    payment: body.payment,
    items: Array.isArray(body.items) ? body.items.map((i) => ({ id: String(i.id), qty: Number(i.qty) })) : [],
  };

  // Це лише для готівки кур'єру. Онлайн-оплата — окремий маршрут
  // /api/order/pay, бо в Telegram і базу замовлення пишемо тільки після
  // підтвердження оплати від LiqPay, а не одразу.
  if (payload.payment === "online") {
    return Response.json({ error: "Для оплати онлайн використовуйте інший запит" }, { status: 400 });
  }

  // Актуальне меню (з Google Таблиці, якщо підключена) — ціни й наявність з браузера не довіряємо.
  const { products, delivery } = await getMenu();
  const productById = new Map(products.map((p) => [p.id, p]));

  const error = validateOrder(payload, productById);
  if (error) return Response.json({ error }, { status: 400 });

  if (!isOpenNow()) {
    return Response.json({ error: `Зараз ми зачинені. Працюємо з ${cafe.hours.open}:00 до ${cafe.hours.close}:00` }, { status: 409 });
  }

  const { subtotal } = calcTotals(payload.items, productById, delivery);
  if (subtotal < cafe.minOrder) {
    return Response.json({ error: `Мінімальне замовлення — ${cafe.minOrder} грн` }, { status: 400 });
  }

  const orderNumber = Date.now().toString().slice(-6);
  try {
    await sendOrderToTelegram(buildOrderMessage(payload, orderNumber, productById, delivery), orderNumber);
  } catch (e) {
    console.error("Не вдалося доставити замовлення в Telegram", e);
    // Клієнту не кажемо «успіх», якщо кухня замовлення не отримала.
    return Response.json({ error: `Не вдалося відправити замовлення. Зателефонуйте нам: ${cafe.phone}` }, { status: 502 });
  }

  // Для щоденної аналітики (scripts/daily-report.mjs). Збій запису в базу не має
  // ламати відповідь клієнту — замовлення на кухню вже пішло успішно.
  try {
    saveOrder(orderNumber, payload, productById, calcTotals(payload.items, productById, delivery));
  } catch (e) {
    console.error("Не вдалося зберегти замовлення для аналітики", e);
  }

  return Response.json({ ok: true, orderNumber });
}
