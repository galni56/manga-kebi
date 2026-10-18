import { cafe } from "@/data/config";
import { isOpenNow } from "@/lib/hours";
import { buildCheckout } from "@/lib/liqpay";
import { getMenu } from "@/lib/menu-source";
import { calcTotals, validateOrder, type OrderPayload } from "@/lib/order";
import { savePendingPayment } from "@/lib/orders-db";

// Готує LiqPay checkout для оплати онлайн. У Telegram/базу-для-звіту замовлення
// потрапляє тільки після підтвердження оплати — дивись /api/liqpay/callback.
export async function POST(request: Request) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return Response.json({ error: "Онлайн-оплата тимчасово недоступна" }, { status: 503 });
  }

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
    payment: "online",
    items: Array.isArray(body.items) ? body.items.map((i) => ({ id: String(i.id), qty: Number(i.qty) })) : [],
  };

  const { products, delivery } = await getMenu();
  const productById = new Map(products.map((p) => [p.id, p]));

  const error = validateOrder(payload, productById);
  if (error) return Response.json({ error }, { status: 400 });

  if (!isOpenNow()) {
    return Response.json({ error: `Зараз ми зачинені. Працюємо з ${cafe.hours.open}:00 до ${cafe.hours.close}:00` }, { status: 409 });
  }

  const totals = calcTotals(payload.items, productById, delivery);
  if (totals.subtotal < cafe.minOrder) {
    return Response.json({ error: `Мінімальне замовлення — ${cafe.minOrder} грн` }, { status: 400 });
  }

  const orderNumber = Date.now().toString().slice(-6);
  try {
    savePendingPayment(orderNumber, payload, productById, totals);
  } catch (e) {
    console.error("Не вдалося зберегти замовлення перед оплатою", e);
    return Response.json({ error: "Не вдалося почати оплату, спробуйте ще раз" }, { status: 500 });
  }

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const { data, signature } = buildCheckout({
    publicKey,
    privateKey,
    orderNumber,
    amount: totals.total,
    description: `Замовлення №${orderNumber}, ${cafe.name}`,
    resultUrl: `${siteUrl}/order/success?n=${orderNumber}`,
    serverUrl: `${siteUrl}/api/liqpay/callback`,
  });

  return Response.json({ data, signature });
}
