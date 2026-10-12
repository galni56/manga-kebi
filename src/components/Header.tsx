"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/hours";

const nav = [
  { label: "Головна", href: "/" },
  { label: "Меню", href: "/#menu" },
  { label: "Доставка та оплата", href: "/delivery" },
  { label: "Контакти", href: "/contacts" },
];

export function Header() {
  const { count, total } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
      <div className="container-x flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden gap-8 text-[13px] font-semibold uppercase tracking-wider lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-dim transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-hover"
          >
            <span>🛒</span>
            <span>{count}</span>
            <span className="hidden sm:inline">· {formatPrice(total)}</span>
          </Link>
          <button
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white lg:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="container-x flex flex-col gap-1 border-t border-line py-3 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 font-medium text-dim hover:bg-warm hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
