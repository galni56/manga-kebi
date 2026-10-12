import { Hero } from "@/components/Hero";
import { CategoryNav, Popular, FullMenu } from "@/components/MenuSection";
import { DeliveryInfo, Features } from "@/components/InfoBlocks";
import { ClosedBanner } from "@/components/OpenStatus";
import { getMenu } from "@/lib/menu-source";

export default async function Home() {
  const { products } = await getMenu();

  return (
    <>
      <ClosedBanner />
      <Hero />
      <div className="flex flex-col gap-24 pt-20">
        <CategoryNav />
        <Popular products={products} />
        <FullMenu products={products} />
        <DeliveryInfo />
      </div>
      <div className="mt-24">
        <Features />
      </div>
    </>
  );
}
