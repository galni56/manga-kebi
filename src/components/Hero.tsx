import Image from "next/image";
import { cafe, workingHoursLabel } from "@/data/config";
import { categories } from "@/data/menu";

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,#f1dfc2,transparent_45%),radial-gradient(circle_at_0%_100%,#f6e7d2,transparent_45%)]" />
        <div className="container-x relative grid items-center gap-14 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.1] text-ink sm:text-6xl">
              Смак мангалу
              <br />
              та казана — <span className="italic text-brand">до ваших дверей</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-dim">
              Кебаб, плов, манти та лагман. Готуємо на вогні й привозимо гарячими прямо до вашого будинку в {cafe.place}.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft">
              <span className="text-gold">☪</span> Все меню — халяль
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="rounded-full bg-brand px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-glow transition hover:bg-brand-hover"
              >
                Дивитись меню
              </a>
              <span className="text-sm text-dim">Щодня {workingHoursLabel}</span>
            </div>
          </div>

          {/* Декоративна арка з реальним фото. */}
          <div className="relative mx-auto w-full max-w-[400px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[28px] shadow-card">
              <Image
                src="/menu/background.png"
                alt={cafe.name}
                fill
                priority
                sizes="(min-width: 1024px) 400px, 80vw"
                className="object-cover"
              />
              <div className="absolute inset-3 rounded-t-[999px] rounded-b-[20px] border border-white/40" />
            </div>
            <div className="absolute -left-4 bottom-16 rounded-2xl bg-white px-4 py-3 shadow-card sm:-left-10">
              <p className="text-xs text-dim">Доставка по {cafe.place}</p>
              <p className="font-display text-lg font-semibold">{cafe.deliveryTimeLabel}</p>
            </div>
            <div className="absolute -right-3 top-24 rounded-2xl bg-white px-4 py-3 shadow-card sm:-right-8">
              <p className="text-xs text-dim">Кухня</p>
              <p className="font-display text-lg font-semibold text-ok">☪ Халяль</p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-espresso py-4 text-[#fbf7f0]" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {categories.map((c) => (
                <span key={c.id} className="flex items-center whitespace-nowrap font-display text-lg italic">
                  <span className="px-8">{c.name}</span>
                  <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
