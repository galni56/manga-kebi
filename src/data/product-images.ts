// Фото страв — окремо від меню, бо працює і зі статичними даними, і з живими
// з Google Таблиці (там колонки для фото немає, підбір іде по назві/вазі).
// Файли лежать у public/menu/. Немає збігу — картка сама покаже емоджі-заглушку.

// "Назва|Вага" — для позицій, де одна назва повторюється кілька разів
// (Айран, Пепсі різного об'єму/тари).
const BY_NAME_AND_WEIGHT: Record<string, string> = {
  "Айран|0,2 л": "/menu/ayran-02.png",
  "Айран|0,5 л": "/menu/ayran-05.png",
  "Пепсі|0,5 л, пляшка": "/menu/pepsi-bottle.png",
  "Пепсі|банка": "/menu/pepsi-can.png",
  "Пепсі|скло": "/menu/pepsi-glass.png",
};

// Просто за назвою — для решти, де назва унікальна.
const BY_NAME: Record<string, string> = {
  Шурпа: "/menu/shurpa.png",
  Мастава: "/menu/mastava.png",
  Лагман: "/menu/lagman.png",
  Борщ: "/menu/borsch.png",
  "Пельменевий суп": "/menu/pelmeni-soup.png",
  "Смажений лагман": "/menu/lagman-fried.png",
  Лагманджун: "/menu/lagmadzhun.png",
  Долма: "/menu/dolma.png",
  Гуляш: "/menu/gulyash.png",
  "Казан-кебаб": "/menu/kazan-kebab.png",
  "Люля-кебаб": "/menu/lyulya-kebab.png",
  "Люля в тісті": "/menu/lyulya-dough.png",
  "Піде з яловичиною": "/menu/pide-beef.png",
  "Піде сирне": "/menu/pide-cheese.png",
  "Піде з куркою": "/menu/pide-chicken.png",
  "Хачапурі сирне": "/menu/khachapuri-cheese.png",
  "Хачапурі яловиче": "/menu/khachapuri-beef.png",
  "Хачапурі куряче": "/menu/khachapuri-cheese.png",
  "Янтик з куркою": "/menu/yantyk-chicken.png",
  "Янтик з яловичиною": "/menu/yantyk-beef.png",
  "Янтик асорті": "/menu/yantyk-assorti.png",
  Пюре: "/menu/mash.png",
  Рис: "/menu/rice.png",
  Гречка: "/menu/buckwheat.png",
  "Відбивна куряча": "/menu/chicken-cutlet.png",
  Манти: "/menu/manty.png",
  Пельмені: "/menu/pelmeni.png",
  Плов: "/menu/plov.png",
  "Шашлик курячий": "/menu/shashlyk-chicken.png",
  "Шашлик з яловичини": "/menu/shashlyk-beef.png",
  // Салати — ключ без "Салат " навмисно: у Google Таблиці цей префікс іноді
  // дописаний, іноді ні (нормалізуємо нижче), тож зіставляти краще без нього.
  Овочевий: "/menu/salad-vegetable.png",
  "Олів'є": "/menu/salad-olivier.png",
  Грецький: "/menu/salad-greek.png",
  Цезар: "/menu/salad-caesar.png",
  Японський: "/menu/salad-japanese.png",
  Вітамінний: "/menu/salad-vitamin.png",
  "Самса куряча": "/menu/samsa-chicken.png",
  "Самса яловича": "/menu/samsa-beef.png",
  // Для тандирної окреме фото ще не присилали — лишається спільне.
  "Самса тандирна": "/menu/samsa.png",
};

const stripSaladPrefix = (name: string) => name.replace(/^салат\s+/i, "").trim();

// Напої в таблиці власники перейменовують найчастіше (об'єм/тара пишуть прямо
// в назві по-різному: "Айран 0.2", "Айран 0,2 л" тощо) — тут шукаємо ключові
// слова в назві+вазі разом, а не точний рядок, щоб такі правки не ламали фото.
function matchDrink(name: string, weight: string): string | undefined {
  const s = `${name} ${weight}`.toLowerCase();
  if (s.includes("айран")) {
    if (s.includes("0.2") || s.includes("0,2")) return "/menu/ayran-02.png";
    if (s.includes("0.5") || s.includes("0,5")) return "/menu/ayran-05.png";
  }
  if (s.includes("пепс")) {
    if (s.includes("банк")) return "/menu/pepsi-can.png";
    if (s.includes("скл")) return "/menu/pepsi-glass.png";
    if (s.includes("пляшк") || s.includes("0.5") || s.includes("0,5")) return "/menu/pepsi-bottle.png";
  }
  if (s.includes("узвар")) return "/menu/uzvar.png";
  return undefined;
}

export function getProductImage(product: { name: string; weight: string }): string | undefined {
  return (
    BY_NAME_AND_WEIGHT[`${product.name}|${product.weight}`] ??
    BY_NAME[product.name] ??
    BY_NAME[stripSaladPrefix(product.name)] ??
    matchDrink(product.name, product.weight)
  );
}
