"use client";

import { useEffect } from "react";
import Image from "next/image";
import { cafe, mangalCutoffLabel } from "@/data/config";
import { categories } from "@/data/menu";
import { getProductImage } from "@/data/product-images";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/hours";
import { closeProduct, useOpenProduct } from "@/lib/productModal";
import { useMangalAvailable } from "./OpenStatus";

// Монтується один раз у layout. На мобілці — шторка знизу, на десктопі — вікно по центру.
// Ніколи не зсуває сітку меню: лежить поверх сторінки, а не всередині картки.
// Товар передається з картки напряму (@/lib/productModal), тож завжди показує ті самі
// (актуальні) дані, з якими рендерилась картка — своє джерело даних модалці не потрібне.
export function ProductModal() {
  const product = useOpenProduct();
  const { lines, add, setQty } = useCart();
  const mangalAvailable = useMangalAvailable();

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProduct();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [product]);

  if (!product) return null;

  const icon = categories.find((c) => c.id === product.category)?.icon ?? "🍽️";
  const image = getProductImage(product);
  const qty = lines[product.id] ?? 0;
  const soldOut = product.available === false;
  const grillClosed = !!product.grill && mangalAvailable === false;
  const blocked = soldOut || grillClosed;
  const blockedNote = soldOut ? product.unavailableNote || cafe.defaultUnavailableNote : `Гриль готуємо тільки до ${mangalCutoffLabel}. Зараз цю страву додати в кошик не можна.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={closeProduct}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-card sm:max-w-md sm:rounded-3xl sm:p-8"
      >
        {image ? (
          <div className="relative -mx-6 -mt-6 mb-4 aspect-[4/3] overflow-hidden rounded-t-3xl sm:-mx-8 sm:-mt-8">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 448px, 100vw"
              className={`object-cover ${soldOut ? "grayscale" : ""}`}
            />
            <button
              type="button"
              onClick={closeProduct}
              aria-label="Закрити"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-xl text-dim backdrop-blur transition hover:bg-white hover:text-ink"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-warm text-4xl ${soldOut ? "grayscale" : ""}`}>{icon}</div>
            <button
              type="button"
              onClick={closeProduct}
              aria-label="Закрити"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-dim transition hover:bg-warm hover:text-ink"
            >
              ✕
            </button>
          </div>
        )}

        <h3 className="font-display text-2xl font-semibold leading-snug">{product.name}</h3>
        {product.weight && <p className="mt-1 text-sm text-dim">{product.weight}</p>}

        {product.composition && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Склад</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{product.composition}</p>
          </div>
        )}

        {blocked && <p className="mt-4 rounded-lg bg-warm p-3 text-xs text-dim">{blockedNote}</p>}

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <span className="font-display text-2xl font-semibold text-brand">{formatPrice(product.price)}</span>
          {blocked && qty === 0 ? (
            <span className="rounded-full bg-warm px-4 py-2.5 text-xs font-semibold text-dim">Недоступно</span>
          ) : qty === 0 ? (
            <button
              onClick={() => add(product.id)}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
            >
              У кошик
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full border border-brand bg-white px-1">
              <button aria-label="Менше" onClick={() => setQty(product.id, qty - 1)} className="h-9 w-8 text-lg text-brand">−</button>
              <span className="w-5 text-center font-semibold">{qty}</span>
              <button
                aria-label="Більше"
                onClick={() => setQty(product.id, qty + 1)}
                disabled={blocked}
                className="h-9 w-8 text-lg text-brand disabled:opacity-30"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
