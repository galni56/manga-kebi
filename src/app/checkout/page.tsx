"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cafe } from "@/data/config";
import { useCart, useMenuProducts } from "@/lib/cart";
import { formatPrice } from "@/lib/hours";
import { calcTotals, paymentLabels, validateOrder, type OrderPayload, type PaymentMethod } from "@/lib/order";
import { ClosedBanner, useIsOpen } from "@/components/OpenStatus";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, setQty, clear } = useCart();
  const { productById, delivery: deliverySettings } = useMenuProducts();
  const isOpen = useIsOpen();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [street, setStreet] = useState("");

  const knownStreets = cafe.streets as readonly string[];
  const streetUnrecognized = useMemo(() => {
    const s = street.trim().toLowerCase();
    return s.length > 0 && !knownStreets.some((k) => k.toLowerCase() === s);
  }, [street, knownStreets]);

  const items = Object.entries(lines).map(([id, qty]) => ({ id, qty }));
  const { delivery, total: grandTotal } = calcTotals(items, productById, deliverySettings);
  const belowMin = total < cafe.minOrder;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    const payload: OrderPayload = {
      name: get("name"),
      phone: get("phone"),
      street: get("street"),
      house: get("house"),
      entrance: get("entrance"),
      floor: get("floor"),
      apartment: get("apartment"),
      comment: get("comment"),
      payment,
      items,
    };
    const problem = validateOrder(payload, productById);
    if (problem) return setError(problem);

    setError(null);
    setSending(true);
    try {
      if (payment === "online") {
        const res = await fetch("/api/order/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Помилка");
        clear();
        submitToLiqpay(data.data, data.signature);
        return;
      }
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Помилка");
      clear();
      router.push(`/order/success?n=${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося відправити замовлення");
      setSending(false);
    }
  }

  // LiqPay приймає оплату тільки через справжній сабміт форми (не fetch/redirect) —
  // збираємо приховану форму й одразу відправляємо, браузер піде на їхню сторінку оплати.
  function submitToLiqpay(data: string, signature: string) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.liqpay.ua/api/3/checkout";
    form.style.display = "none";
    for (const [name, value] of [["data", data], ["signature", signature]]) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">Кошик порожній</h1>
        <Link href="/#menu" className="mt-6 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-hover">
          Перейти до меню
        </Link>
      </div>
    );
  }

  return (
    <>
      <ClosedBanner />
      <div className="container-x py-10">
        <h1 className="mb-8 font-display text-4xl font-semibold">Оформлення замовлення</h1>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <form id="order-form" onSubmit={onSubmit} className="space-y-6">
            <fieldset className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-soft">
              <legend className="px-2 font-display text-xl font-semibold">Контакти</legend>
              <input name="name" className="field" placeholder="Ім'я" autoComplete="name" />
              <input name="phone" type="tel" className="field" placeholder="Телефон, 0XX XXX XX XX" autoComplete="tel" />
            </fieldset>

            <fieldset className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-soft">
              <legend className="px-2 font-display text-xl font-semibold">Адреса в {cafe.place}</legend>
              <input
                name="street"
                list="street-suggestions"
                className="field"
                placeholder="Вулиця"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <datalist id="street-suggestions">
                {knownStreets.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {streetUnrecognized && (
                <p className="text-xs text-brand">
                  Не впізнали цю вулицю — переконайтесь, що адреса в межах {cafe.place}, інакше кур&apos;єр не зможе доїхати.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <input name="house" className="field" placeholder="Будинок" />
                <input name="entrance" className="field" placeholder="Під'їзд" />
                <input name="floor" className="field" placeholder="Поверх" />
                <input name="apartment" className="field" placeholder="Квартира" />
              </div>
              <textarea name="comment" rows={3} className="field" placeholder="Коментар (домофон, побажання)" />
            </fieldset>

            <fieldset className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-soft">
              <legend className="px-2 font-display text-xl font-semibold">Оплата</legend>
              {(Object.keys(paymentLabels) as PaymentMethod[]).map((k) => (
                <label key={k} className="flex cursor-pointer items-center gap-3">
                  <input type="radio" name="payment" checked={payment === k} onChange={() => setPayment(k)} className="accent-brand" />
                  {paymentLabels[k]}
                </label>
              ))}
              <p className="pt-1 text-xs text-faint">
                <Link href="/oferta" className="hover:text-brand hover:underline">Реквізити та умови повернення</Link>
              </p>
            </fieldset>
          </form>

          <aside className="h-fit space-y-4 rounded-2xl border border-line bg-white p-5 shadow-card lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Ваше замовлення</h2>
            <ul className="divide-y divide-line">
              {items.map(({ id, qty }) => {
                const p = productById.get(id);
                if (!p) return null; // рядок з кошика, якого ще немає в щойно завантаженому меню
                return (
                  <li key={id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-dim">{formatPrice(p.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button aria-label="Менше" onClick={() => setQty(id, qty - 1)} className="h-8 w-8 rounded-lg border border-line">−</button>
                      <span className="w-5 text-center">{qty}</span>
                      <button aria-label="Більше" onClick={() => setQty(id, qty + 1)} className="h-8 w-8 rounded-lg border border-line">+</button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-1 border-t border-line pt-3 text-dim">
              <div className="flex justify-between"><span>Страви</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between">
                <span>Доставка · {cafe.deliveryTimeLabel}</span>
                <span>{delivery === 0 ? "безкоштовно" : formatPrice(delivery)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ink"><span>Разом</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            {belowMin && (
              <p className="text-xs text-brand">
                Мінімальне замовлення — {cafe.minOrder} грн. Додайте ще на {cafe.minOrder - total} грн.
              </p>
            )}
            {isOpen === false && (
              <p className="rounded-lg bg-warm p-3 text-xs text-brand">
                Зараз ми зачинені. Кнопка стане активною з {cafe.hours.open}:00 до {cafe.hours.close}:00.
              </p>
            )}
            {error && <p role="alert" className="rounded-lg bg-warm p-3 text-sm text-brand">{error}</p>}
            <button
              type="submit"
              form="order-form"
              disabled={sending || belowMin || isOpen === false}
              className="w-full rounded-full bg-brand py-3.5 font-semibold text-white shadow-glow transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Зачекайте…" : payment === "online" ? "Перейти до оплати" : "Підтвердити замовлення"}
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}
