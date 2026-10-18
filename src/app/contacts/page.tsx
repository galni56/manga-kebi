import { cafe, deliveryHoursLabel, workingHoursLabel } from "@/data/config";

export const metadata = { title: "Контакти — Мангал і Казан" };

export default function ContactsPage() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-8 font-display text-4xl font-semibold">Контакти</h1>
      <div className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <p><span className="text-dim">Адреса:</span> {cafe.address}</p>
        <p>
          <span className="text-dim">Телефон:</span>{" "}
          <a href={cafe.phoneHref} className="font-semibold text-brand">{cafe.phone}</a>
        </p>
        <p><span className="text-dim">Графік:</span> щодня {workingHoursLabel}</p>
        <p><span className="text-dim">Доставка:</span> щодня {deliveryHoursLabel}</p>
      </div>
    </div>
  );
}
