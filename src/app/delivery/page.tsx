import Link from "next/link";
import { cafe, deliveryHoursLabel, mangalCutoffLabel, workingHoursLabel } from "@/data/config";
import { getMenu } from "@/lib/menu-source";

export const metadata = { title: "Доставка та оплата — Мангал і Казан" };

export default async function DeliveryPage() {
  const { delivery } = await getMenu();
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-8 font-display text-4xl font-semibold">Доставка та оплата</h1>
      <div className="space-y-8 text-dim">
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Зона доставки</h2>
          <p>Доставляємо тільки по території {cafe.place}. Адресу можна обрати зі списку вулиць під час оформлення.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Умови</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Мінімальне замовлення — {cafe.minOrder} грн</li>
            <li>Доставка — {delivery.fee} грн</li>
            {delivery.packagingPerItem > 0 && <li>Упаковка — {delivery.packagingPerItem} грн за кожну порцію (крім напоїв)</li>}
            <li>Орієнтовний час доставки — {cafe.deliveryTimeLabel}</li>
            <li>
              Приймаємо замовлення на доставку щодня {deliveryHoursLabel} (кафе працює {workingHoursLabel})
              {cafe.mangalCutoff.enabled && `, гриль (шашлик, люля-кебаб) — до ${mangalCutoffLabel}`}
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Халяль</h2>
          <p>Все меню {cafe.name} — халяль. У нашій кухні немає свинини.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Оплата</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Готівкою кур&apos;єру</li>
            <li>Онлайн на сайті (LiqPay)</li>
          </ul>
          <p className="mt-4">
            <Link href="/oferta" className="text-brand hover:underline">Реквізити та умови повернення</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
