"use client";

import { useSyncExternalStore } from "react";
import type { Product } from "@/data/menu";

// Стан "яка картка відкрита" — маленький зовнішній стор, як і кошик. Зберігаємо сам
// товар (не id): модалка монтується один раз у layout, поза картками, і так їй не
// потрібне окреме джерело живих даних — вона показує те, що передала картка.
let current: Product | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Product | null {
  return current;
}

function commit(next: Product | null) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const openProduct = (product: Product) => commit(product);
export const closeProduct = () => commit(null);

export function useOpenProduct() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
