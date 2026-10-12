import Link from "next/link";
import { cafe, workingHoursLabel } from "@/data/config";
import { Ornament } from "./SectionTitle";

export function Footer() {
  return (
    <footer className="border-t border-white bg-espresso text-[#fbf7f0]/70">
      <div className="container-x py-14">
        <div className="mb-10 text-center">
          <p className="font-display text-3xl font-semibold text-[#fbf7f0]">{cafe.name}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">{cafe.place} · Халяль</p>
          <Ornament className="mt-4" />
        </div>
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Навігація</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-gold">Головна</Link></li>
              <li><Link href="/#menu" className="hover:text-gold">Меню</Link></li>
              <li><Link href="/delivery" className="hover:text-gold">Доставка та оплата</Link></li>
              <li><Link href="/contacts" className="hover:text-gold">Контакти</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Контакти</h3>
            <ul className="space-y-2">
              <li>{cafe.address}</li>
              <li><a href={cafe.phoneHref} className="hover:text-gold">{cafe.phone}</a></li>
              <li>Щодня {workingHoursLabel}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Правова інформація</h3>
            <ul className="space-y-2">
              <li><Link href="/oferta" className="hover:text-gold">Реквізити та умови повернення</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-[#fbf7f0]/40">
        © {new Date().getFullYear()} {cafe.name}. Всі права захищені
      </div>
    </footer>
  );
}
