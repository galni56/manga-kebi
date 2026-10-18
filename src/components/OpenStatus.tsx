"use client";

import { useEffect, useState } from "react";
import { deliveryHoursLabel } from "@/data/config";
import { isMangalAvailable, isOpenNow } from "@/lib/hours";

export function useIsOpen() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setOpen(isOpenNow());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return open;
}

/** null поки невідомо (перший рендер на сервері), далі — чи ще готують гриль. */
export function useMangalAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setAvailable(isMangalAvailable());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return available;
}

export function ClosedBanner() {
  const open = useIsOpen();
  if (open !== false) return null;
  return (
    <div className="border-b border-brand/40 bg-warm py-3 text-center text-sm">
      Доставка зараз не працює. Приймаємо замовлення щодня з {deliveryHoursLabel}.
    </div>
  );
}
