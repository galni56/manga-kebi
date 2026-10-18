import { cafe, mangalCutoffLabel } from "@/data/config";
import type { Product } from "@/data/menu";
import { isMangalAvailable } from "@/lib/hours";

export type PaymentMethod = "cash" | "online";

export type OrderPayload = {
  name: string;
  phone: string;
  street: string;
  house: string;
  entrance: string;
  floor: string;
  apartment: string;
  comment: string;
  payment: PaymentMethod;
  items: { id: string; qty: number }[];
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: "Готівка кур'єру",
  online: "Оплата онлайн",
};

export const normalizePhone = (raw: string) => raw.replace(/[\s()\-]/g, "");
export const isValidPhone = (raw: string) => /^(\+?38)?0\d{9}$/.test(normalizePhone(raw));

/** normalizePhone(...) -> "tel:+380..." для кнопки дзвінка в Telegram. */
export function toTelHref(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("380")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+38${digits}`;
  return `tel:+${digits}`;
}

/**
 * Повертає текст помилки або null. Викликається і на клієнті, і на сервері — в обох
 * місцях productById треба передавати актуальний (з getMenu() / useMenuProducts()),
 * бо ціни й наявність тепер можуть приходити з Google Таблиці.
 */
export function validateOrder(o: OrderPayload, productById: Map<string, Product>, now: Date = new Date()): string | null {
  if (o.name.trim().length < 2) return "Вкажіть ім'я";
  if (!isValidPhone(o.phone)) return "Вкажіть телефон у форматі 0XXXXXXXXX";
  if (!o.street.trim()) return "Вкажіть вулицю";
  if (!o.house.trim()) return "Вкажіть номер будинку";
  if (!o.apartment.trim()) return "Вкажіть квартиру";
  if (!(o.payment in paymentLabels)) return "Оберіть спосіб оплати";
  if (o.items.length === 0) return "Кошик порожній";
  for (const it of o.items) {
    const p = productById.get(it.id);
    if (!p || !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99) {
      return "Некоректний склад замовлення";
    }
    if (p.available === false) {
      return `Страва «${p.name}» зараз закінчилася. Приберіть її з кошика`;
    }
  }
  if (!isMangalAvailable(now) && o.items.some((it) => productById.get(it.id)?.grill)) {
    return `Гриль (шашлик, люля-кебаб) готуємо тільки до ${mangalCutoffLabel}. Приберіть ці страви з кошика`;
  }
  return null;
}

/** Вартість доставки: з Google Таблиці (рядок категорії "Налаштування"), інакше — з config.ts. */
export type DeliverySettings = { fee: number };
export const defaultDelivery: DeliverySettings = { fee: cafe.deliveryFee };

/** Сума рахується з меню на сервері, ціни з браузера не довіряємо. */
export function calcTotals(
  items: OrderPayload["items"],
  productById: Map<string, Product>,
  deliverySettings: DeliverySettings = defaultDelivery,
) {
  const subtotal = items.reduce((s, it) => s + (productById.get(it.id)?.price ?? 0) * it.qty, 0);
  const delivery = deliverySettings.fee;
  return { subtotal, delivery, total: subtotal + delivery };
}
