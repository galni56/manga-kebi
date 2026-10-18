import { cafe, deliveryUntilLabel, workingHoursLabel } from "@/data/config";

export function TopBar() {
  return (
    <div className="bg-espresso text-xs text-[#fbf7f0]/70">
      <div className="container-x flex h-10 items-center justify-between gap-4">
        <span>🕘 Щодня {workingHoursLabel} · доставка {deliveryUntilLabel}</span>
        <div className="flex items-center gap-4">
          <span className="hidden truncate sm:inline">📍 {cafe.address}</span>
          <a href={cafe.phoneHref} className="shrink-0 font-semibold text-[#fbf7f0] transition hover:text-gold">
            {cafe.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
