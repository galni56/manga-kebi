import Image from "next/image";
import { categories, type Product } from "@/data/menu";
import { ProductCard } from "./ProductCard";
import { SectionTitle } from "./SectionTitle";

export function CategoryNav() {
  return (
    <section className="container-x">
      <SectionTitle eyebrow="Обирайте за настроєм" title="Наші напрями" />
      <div className="grid grid-cols-3 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
        {categories.map((c) => (
          <a key={c.id} href={`#cat-${c.id}`} className="group flex flex-col items-center gap-3 text-center">
            <span className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-line bg-white shadow-soft transition group-hover:-translate-y-1 group-hover:border-gold group-hover:shadow-card">
              <Image src={c.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <span className="text-[13px] font-semibold text-ink transition group-hover:text-brand">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Popular({ products }: { products: Product[] }) {
  return (
    <section className="container-x">
      <SectionTitle eyebrow="Обрані страви" title="Вибір наших гостей" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.filter((p) => p.popular).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function FullMenu({ products }: { products: Product[] }) {
  return (
    <section id="menu" className="container-x">
      <SectionTitle eyebrow="Повне меню" title="Меню" />
      {categories.map((c) => (
        <div key={c.id} id={`cat-${c.id}`} className="mb-14">
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-display text-2xl font-semibold">
              {c.icon} {c.name}
            </h3>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.filter((p) => p.category === c.id).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
