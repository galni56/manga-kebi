import { cafe } from "@/data/config";

function partNum(now: Date, unit: "hour" | "minute"): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      [unit]: "numeric",
      hour12: false,
      timeZone: cafe.timezone,
    }).format(now),
  );
}

function minutesNow(now: Date): number {
  return partNum(now, "hour") * 60 + partNum(now, "minute");
}

export function isOpenNow(now: Date = new Date()): boolean {
  const mins = minutesNow(now);
  return mins >= cafe.hours.open * 60 && mins < cafe.hours.close * 60;
}

/** Гриль (шашлик, люля-кебаб) готують тільки до cafe.mangalCutoff, навіть коли кафе ще відкрите. */
export function isMangalAvailable(now: Date = new Date()): boolean {
  if (!cafe.mangalCutoff.enabled) return true;
  const mins = minutesNow(now);
  return mins < cafe.mangalCutoff.hour * 60 + cafe.mangalCutoff.minute;
}

export const formatPrice = (value: number) => `${value} грн`;
