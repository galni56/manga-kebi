"use client";

import Image from "next/image";
import { cafe, mangalCutoffLabel } from "@/data/config";
import { categories, type Product } from "@/data/menu";
import { getProductImage } from "@/data/product-images";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/hours";
import { openProduct } from "@/lib/productModal";
import { useMangalAvailable } from "./OpenStatus";

export function ProductCard({ product }: { product: Product }) {
  const { lines, add, setQty } = useCart();
  const mangalAvailable = useMangalAvailable();
  const qty = lines[product.id] ?? 0;
  const icon = categories.find((c) => c.id === product.category)?.icon ?? "🍽️";
  const image = getProductImage(product);
  const soldOut = product.available === false;
  const grillClosed = !!product.grill && mangalAvailable === false;
  const blocked = soldOut || grillClosed;
  const blockedNote = soldOut ? product.unavailableNote || cafe.defaultUnavailableNote : `Гриль до ${mangalCutoffLabel}`;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition duration-300 ${soldOut ? "grayscale" : "hover:-translate-y-1 hover:shadow-card"}`}
    >
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-[#f7e6cf] via-warm to-[#efd9b8] text-7xl">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition duration-500 ${soldOut ? "" : "group-hover:scale-110"}`}
          />
        ) : (
          <span className={`transition duration-500 ${soldOut ? "" : "group-hover:scale-110"}`}>{icon}</span>
        )}
        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Немає в наявності
          </span>
        ) : (
          product.popular && (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Хіт
            </span>
          )
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-dim backdrop-blur">
          {product.weight}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-xl font-semibold leading-snug">{product.name}</h3>
        {product.description && <p className="text-[13px] text-dim">{product.description}</p>}
        {/* Фіксована висота (2 рядки) навіть без складу — щоб картки в ряду лишались однакового розміру. */}
        {product.composition ? (
          <button
            type="button"
            onClick={() => openProduct(product)}
            className="mt-1 line-clamp-2 min-h-[2.6em] text-left text-[13px] leading-snug text-dim transition hover:text-brand"
          >
            {product.composition}
          </button>
        ) : (
          <div className="mt-1 min-h-[2.6em]" aria-hidden="true" />
        )}
        {soldOut && <p className="mt-1 text-[13px] text-dim">{blockedNote}</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-2xl font-semibold text-brand">{formatPrice(product.price)}</span>
          {blocked && qty === 0 ? (
            <span className="rounded-full bg-warm px-4 py-2.5 text-xs font-semibold text-dim">
              {soldOut ? "Немає" : blockedNote}
            </span>
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
    </article>
  );
}
