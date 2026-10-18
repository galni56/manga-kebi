import Link from "next/link";
import { cafe } from "@/data/config";
import { getOrderStatus } from "@/lib/orders-db";

export const metadata = { title: "Замовлення прийнято — Мангал і Казан" };

// Сюди LiqPay повертає клієнта після оплати (result_url), а сайт — після замовлення готівкою.
// Статус беремо з бази: підтвердження оплати приходить від LiqPay окремо (callback)
// і може запізнитися на хвилину, якщо банк перевіряє платіж (wait_secure).
export default async function SuccessPage({ searchParams }: PageProps<"/order/success">) {
  const { n } = await searchParams;
  const number = typeof n === "string" && /^\d{1,12}$/.test(n) ? n : null;

  let status: string | null = null;
  try {
    status = number ? getOrderStatus(number) : null;
  } catch (e) {
    console.error("Не вдалося прочитати статус замовлення", e);
  }

  if (status === "pending_payment") {
    return (
      <div className="container-x py-24 text-center">
        {/* Поки банк не підтвердив оплату — оновлюємо сторінку, щоб клієнт побачив результат. */}
        <meta httpEquiv="refresh" content="5" />
        <p className="text-6xl">⏳</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Чекаємо підтвердження оплати</h1>
        {number && <p className="mt-2 text-dim">Номер замовлення: <b className="text-ink">№{number}</b></p>}
        <p className="mx-auto mt-4 max-w-md text-dim">
          Банк перевіряє платіж — зазвичай це до хвилини. Сторінка оновиться сама. Питання — за телефоном{" "}
          <a href={cafe.phoneHref} className="font-semibold text-brand">{cafe.phone}</a>.
        </p>
      </div>
    );
  }

  if (status === "payment_failed") {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-6xl">❌</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">Оплата не пройшла</h1>
        {number && <p className="mt-2 text-dim">Номер замовлення: <b className="text-ink">№{number}</b></p>}
        <p className="mx-auto mt-4 max-w-md text-dim">
          Гроші не списані. Спробуйте ще раз або оберіть оплату готівкою. Питання — за телефоном{" "}
          <a href={cafe.phoneHref} className="font-semibold text-brand">{cafe.phone}</a>.
        </p>
        <Link href="/checkout" className="mt-8 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-hover">
          Спробувати ще раз
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-24 text-center">
      <p className="text-6xl">✅</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">Дякуємо! Замовлення прийнято</h1>
      {number && <p className="mt-2 text-dim">Номер замовлення: <b className="text-ink">№{number}</b></p>}
      <p className="mx-auto mt-4 max-w-md text-dim">
        Ми вже готуємо. Якщо щось зміниться, зателефонуємо вам. Питання — за телефоном{" "}
        <a href={cafe.phoneHref} className="font-semibold text-brand">{cafe.phone}</a>.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-hover">
        На головну
      </Link>
    </div>
  );
}
