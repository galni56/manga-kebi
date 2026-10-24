import Link from "next/link";
import { cafe } from "@/data/config";
import { SectionTitle } from "./SectionTitle";

export function DeliveryInfo() {
  return (
    <section className="container-x">
      <SectionTitle eyebrow="Як отримати" title="Доставка та самовивіз" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gold/30 bg-warm p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand">
              Мінімальне замовлення — {cafe.minOrder} грн
            </span>
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand">
              ⏱ {cafe.deliveryTimeLabel}
            </span>
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold">Доставка по {cafe.place}</h3>
          <p className="mt-3 text-dim">
            Доставляємо до під&apos;їзду по території ЖК, зазвичай за {cafe.deliveryTimeLabel}. Оплата онлайн або готівкою кур&apos;єру.
          </p>
          <Link href="/delivery" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">
            Детальніше →
          </Link>
        </div>
        <div className="rounded-3xl border border-line bg-white p-8">
          <span className="rounded-full bg-warm px-4 py-1.5 text-xs font-semibold text-brand">Без мінімуму</span>
          <h3 className="mt-5 font-display text-2xl font-semibold">Самовивіз</h3>
          <p className="mt-3 text-dim">Заберіть замовлення самостійно в кафе: {cafe.address}.</p>
          <Link href="/contacts" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">
            Як нас знайти →
          </Link>
        </div>
      </div>
    </section>
  );
}

// TODO: власники мають підтвердити, що ці тези відповідають дійсності.
const features = [
  { icon: "☪", title: "Халяль", desc: "Все меню — халяль, без свинини." },
  { icon: "🔥", title: "Мангал і казан", desc: "Шашлик і кебаб на вугіллі, плов у казані." },
  { icon: "🛵", title: "Швидка доставка по ЖК", desc: "Кур'єр — співробітник кафе, ви поруч." },
  { icon: "💳", title: "Зручна оплата", desc: "Онлайн або готівкою при отриманні." },
];

export function Features() {
  return (
    <section className="bg-espresso py-20">
      <div className="container-x">
        <SectionTitle eyebrow="Наші переваги" title="Чому обирають нас" light />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="border-t border-gold/40 pt-6">
              <p className="text-4xl">{f.icon}</p>
              <h3 className="mt-3 font-display text-xl font-bold text-[#fbf7f0]">{f.title}</h3>
              <p className="mt-2 text-[#fbf7f0]/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
