import { getMenu } from "@/lib/menu-source";

// Клієнтські компоненти (кошик, оформлення) не можуть самі робити кешований fetch з
// revalidate — тому ходять сюди, а тут ми вже викликаємо getMenu() з кешем на сервері.
export async function GET() {
  const { products, delivery } = await getMenu();
  return Response.json({ products, delivery });
}
