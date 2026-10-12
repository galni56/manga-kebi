"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { productById as staticProductById, type Product } from "@/data/menu";

type Lines = Record<string, number>;

const STORAGE_KEY = "mangal-kebab-cart";
const EMPTY: Lines = {};
const STATIC_PRODUCTS = Array.from(staticProductById.values());

// Кошик — маленький зовнішній стор із localStorage: без гідраційних розбіжностей і без setState в ефектах.
let current: Lines | null = null;
const listeners = new Set<() => void>();

function read(): Lines {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const valid: Lines = {};
    for (const [id, qty] of Object.entries(saved)) {
      // Тут не звіряємось із конкретним меню (воно може бути ще не завантажене) —
      // товари, яких немає в актуальному меню, useCart() сам прибере нижче.
      if (typeof id === "string" && Number.isInteger(qty) && (qty as number) > 0) valid[id] = qty as number;
    }
    return valid;
  } catch {
    return {};
  }
}

function getSnapshot(): Lines {
  return (current ??= read());
}

function commit(next: Lines) {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      current = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const add = (id: string) => {
  const l = getSnapshot();
  commit({ ...l, [id]: (l[id] ?? 0) + 1 });
};
const setQty = (id: string, qty: number) => {
  const next = { ...getSnapshot() };
  if (qty <= 0) delete next[id];
  else next[id] = Math.min(qty, 99);
  commit(next);
};
const clear = () => commit({});

// Живі ціни з Google Таблиці (через /api/menu) — вантажимо один раз на клієнті,
// поки не прийшли — показуємо вбудоване меню, щоб цифри не стрибали з нуля.
let menuProducts: Product[] | null = null;
let menuFetchStarted = false;
const menuListeners = new Set<() => void>();

function ensureMenuLoaded() {
  if (menuFetchStarted) return;
  menuFetchStarted = true;
  fetch("/api/menu")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { products: Product[] }) => {
      menuProducts = data.products;
      menuListeners.forEach((l) => l());
    })
    .catch(() => {
      menuFetchStarted = false; // дозволяємо спробувати ще раз при наступному рендері
    });
}

function subscribeMenu(listener: () => void) {
  menuListeners.add(listener);
  return () => menuListeners.delete(listener);
}

function getMenuSnapshot(): Product[] | null {
  return menuProducts;
}

/** products/productById — живі, якщо /api/menu вже відповів, інакше — вбудоване меню. */
export function useMenuProducts() {
  const live = useSyncExternalStore(subscribeMenu, getMenuSnapshot, () => null);
  useEffect(() => {
    ensureMenuLoaded();
  }, []);
  const products = live ?? STATIC_PRODUCTS;
  return useMemo(
    () => ({ products, productById: new Map(products.map((p) => [p.id, p])), ready: live !== null }),
    [products, live],
  );
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const { productById, ready } = useMenuProducts();

  // Товар перейменували/прибрали в таблиці — тихо прибираємо його з кошика клієнта.
  useEffect(() => {
    if (!ready) return;
    const stale = Object.keys(lines).filter((id) => !productById.has(id));
    if (stale.length > 0) {
      const next = { ...lines };
      stale.forEach((id) => delete next[id]);
      commit(next);
    }
  }, [ready, productById, lines]);

  return useMemo(() => {
    let count = 0;
    let total = 0;
    for (const [id, qty] of Object.entries(lines)) {
      const p = productById.get(id);
      if (!p) continue;
      count += qty;
      total += p.price * qty;
    }
    return { lines, count, total, add, setQty, clear };
  }, [lines, productById]);
}
