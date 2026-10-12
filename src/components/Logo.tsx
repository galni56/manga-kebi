import Link from "next/link";
import { cafe } from "@/data/config";

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-[28px]">
        {cafe.name}
      </span>
    </Link>
  );
}
