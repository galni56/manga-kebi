import { cafe } from "@/data/config";

export const metadata = { title: `Реквізити та оферта — ${cafe.name}` };

export default function OfertaPage() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-8 font-display text-4xl font-semibold">Реквізити та умови оплати</h1>
      <div className="space-y-8 text-dim">
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Реквізити продавця</h2>
          <ul className="space-y-1">
            <li>ФОП Абібулаєв Єдем Алядінович</li>
            <li>РНОКПП / ЄДРПОУ: 3181722854</li>
            <li>IBAN: UA593052990000026008030112617</li>
            <li>Телефон: <a href="tel:+380982938776" className="hover:text-brand">+380 98 293 87 76</a></li>
            <li>Адреса: {cafe.address}</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 font-display text-2xl font-semibold text-ink">Умови повернення</h2>
          <p>
            Скасувати замовлення можна в будь-який момент до його видачі кур&apos;єру — напишіть або
            зателефонуйте нам за номером вище. Якщо замовлення було оплачено онлайн і скасоване
            (в тому числі з боку {cafe.name}, наприклад через відсутність позиції), кошти повертаються
            в повному обсязі на картку, з якої здійснювалась оплата.
          </p>
        </section>
      </div>
    </div>
  );
}
