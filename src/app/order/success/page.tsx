import Link from "next/link";
import { cafe } from "@/data/config";

export const metadata = { title: "Замовлення прийнято — Мангал і Казан" };

export default async function SuccessPage({ searchParams }: PageProps<"/order/success">) {
  const { n } = await searchParams;
  const number = typeof n === "string" ? n : null;

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
