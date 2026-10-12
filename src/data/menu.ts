// Реальне меню кафе (надане власниками 22.09.2026).
// Це — резервні дані: сайт показує їх, поки не налаштовано MENU_SHEET_CSV_URL (@/lib/menu-source)
// або якщо Google Таблиця тимчасово недоступна. Категорії (список і іконки) завжди беруться звідси,
// їх таблиця не змінює — лише ціни, склад, наявність і "хіт"/"гриль" для вже існуючих категорій.
// TODO: 2 позиції без вказаної ціни — див. коментарі нижче, ціну треба уточнити перед запуском.
export type Category = { id: string; name: string; icon: string; image: string };

export type Product = {
  id: string;
  category: string;
  name: string;
  weight: string;
  description: string;
  /** Повний склад страви — показується в модалці "Склад", не в картці, щоб не зсувати сітку. */
  composition?: string;
  price: number;
  popular?: boolean;
  /** Готується на мангалі — доступно тільки до cafe.mangalCutoff, перевіряється при замовленні. */
  grill?: boolean;
  /** false — страви немає в наявності. Відсутнє поле = є в наявності. */
  available?: boolean;
  /** Показується замість "У кошик", коли available === false. Якщо порожнє — береться cafe.defaultUnavailableNote. */
  unavailableNote?: string;
};

export const categories: Category[] = [
  { id: "soups", name: "Перші страви", icon: "🥣", image: "/menu/shurpa.png" },
  { id: "mangal", name: "Мангал", icon: "🔥", image: "/menu/shashlyk-beef.png" },
  { id: "main", name: "Основні страви", icon: "🍢", image: "/menu/plov.png" },
  { id: "pastry", name: "Випічка", icon: "🥟", image: "/menu/samsa-beef.png" },
  { id: "sides", name: "Гарніри", icon: "🍚", image: "/menu/rice.png" },
  { id: "salads", name: "Салати", icon: "🥗", image: "/menu/salad-caesar.png" },
  { id: "drinks", name: "Напої", icon: "🥤", image: "/menu/ayran-05.png" },
];

export const products: Product[] = [
  // Перші страви
  { id: "soup-shurpa", category: "soups", name: "Шурпа", weight: "500 г", description: "", composition: "Баранина, картопля, морква, зелень, нут", price: 200, popular: true },
  { id: "soup-lagman", category: "soups", name: "Лагман", weight: "500 г", description: "", composition: "Яловичина, домашня локшина, овочі, зелень", price: 200 },
  { id: "soup-mastava", category: "soups", name: "Мастава", weight: "500 г", description: "", composition: "Яловичина, рис, овочі", price: 200 },
  { id: "soup-pelmeni-broth", category: "soups", name: "Пельменевий суп", weight: "500 г", description: "", composition: "Яловичий фарш, бульйон, зелень, тісто", price: 200 },
  { id: "soup-borsch", category: "soups", name: "Борщ", weight: "500 г", description: "", composition: "Яловичина, капуста, буряк", price: 200 },

  // Мангал — гриль, доступно тільки до cafe.mangalCutoff
  { id: "mangal-shashlyk-chicken", category: "mangal", name: "Шашлик курячий", weight: "200 г", description: "", composition: "Куряче м'ясо, маринована цибуля, лаваш, кетчуп", price: 200, grill: true },
  { id: "mangal-shashlyk-beef", category: "mangal", name: "Шашлик з яловичини", weight: "180 г", description: "", composition: "Яловичина, маринована цибуля, лаваш, кетчуп", price: 270, popular: true, grill: true },
  { id: "mangal-lyulya-kebab", category: "mangal", name: "Люля-кебаб", weight: "250 г", description: "", composition: "Яловичий фарш, маринована цибуля, лаваш, кетчуп", price: 220, grill: true },

  // Основні страви
  { id: "main-gulyash", category: "main", name: "Гуляш", weight: "350 г", description: "", composition: "Яловичина, картопля", price: 150 },
  { id: "main-plov", category: "main", name: "Плов", weight: "400 г", description: "", composition: "Яловичина, рис, морква, зіра", price: 180, popular: true },
  { id: "main-kazan-kebab", category: "main", name: "Казан-кебаб", weight: "400 г", description: "", composition: "Яловичина, картопля, овочі, маринована цибуля", price: 350 },
  { id: "main-manty", category: "main", name: "Манти", weight: "350 г", description: "", composition: "Яловичий фарш, цибуля, овочі, тісто", price: 220, popular: true },
  { id: "main-pelmeni", category: "main", name: "Пельмені", weight: "300 г", description: "", composition: "Яловичий фарш, тісто", price: 180 },
  { id: "main-dolma", category: "main", name: "Долма", weight: "350 г", description: "", composition: "Виноградне листя, яловичий фарш, огірки, соус", price: 200 },
  { id: "main-business-lunch", category: "main", name: "Бізнес-ланч", weight: "", description: "", composition: "Плов (0,5 порції), мастава або шурпа (0,5 порції), салат (0,5 порції), коржик", price: 200 },

  // Випічка
  { id: "pastry-lagman-fried", category: "pastry", name: "Смажений лагман", weight: "350 г", description: "", composition: "Яловичина, локшина, смажене яйце, овочі", price: 200 },
  { id: "pastry-lyulya-dough", category: "pastry", name: "Люля в тісті", weight: "250 г", description: "", composition: "Люля-кебаб, тісто, овочі", price: 100 },
  { id: "pastry-samsa-chicken", category: "pastry", name: "Самса куряча", weight: "200 г", description: "", composition: "Курячий фарш, листкове тісто", price: 100 },
  { id: "pastry-samsa-beef", category: "pastry", name: "Самса яловича", weight: "200 г", description: "", composition: "Яловичий фарш, листкове тісто", price: 110 },
  { id: "pastry-samsa-tandir", category: "pastry", name: "Самса тандирна", weight: "250 г", description: "", composition: "Яловичий фарш, цибуля, тісто", price: 120 },
  // TODO: ціну не вказано в наданому меню, тимчасово взято як у "Хачапурі курячій" (100 грн) — уточнити.
  { id: "pastry-khachapuri-cheese", category: "pastry", name: "Хачапурі сирне", weight: "280 г", description: "", composition: "Сир, тісто", price: 100 },
  // TODO: ціну не вказано в наданому меню, тимчасово взято як у "Хачапурі курячій" (100 грн) — уточнити.
  { id: "pastry-khachapuri-beef", category: "pastry", name: "Хачапурі яловиче", weight: "300 г", description: "", composition: "Яловичий фарш, тісто", price: 100 },
  { id: "pastry-khachapuri-chicken", category: "pastry", name: "Хачапурі куряче", weight: "300 г", description: "", composition: "Курячий фарш, тісто", price: 100 },
  { id: "pastry-lagmadzhun", category: "pastry", name: "Лагманджун", weight: "350 г", description: "", composition: "Яловичий фарш, овочі, зелень, тісто", price: 150 },
  { id: "pastry-pide-chicken", category: "pastry", name: "Піде з куркою", weight: "450 г", description: "", composition: "Курячий фарш, цибуля, тісто", price: 200 },
  { id: "pastry-pide-beef", category: "pastry", name: "Піде з яловичиною", weight: "450 г", description: "", composition: "Яловичий фарш, цибуля, тісто", price: 200 },
  { id: "pastry-pide-cheese", category: "pastry", name: "Піде сирне", weight: "450 г", description: "", composition: "Сир моцарела", price: 200 },
  { id: "pastry-yantyk-chicken", category: "pastry", name: "Янтик з куркою", weight: "250 г", description: "", composition: "Курячий фарш, тісто", price: 100 },
  { id: "pastry-yantyk-beef", category: "pastry", name: "Янтик з яловичиною", weight: "250 г", description: "", composition: "Яловичий фарш, тісто", price: 100 },
  { id: "pastry-yantyk-assorti", category: "pastry", name: "Янтик асорті", weight: "250 г", description: "", composition: "Фарш, сир, тісто", price: 130 },

  // Гарніри
  { id: "sides-mash", category: "sides", name: "Пюре", weight: "350 г", description: "", price: 80 },
  { id: "sides-rice", category: "sides", name: "Рис", weight: "350 г", description: "", price: 80 },
  { id: "sides-buckwheat", category: "sides", name: "Гречка", weight: "350 г", description: "", price: 80 },
  { id: "sides-chicken-cutlet", category: "sides", name: "Відбивна куряча", weight: "100 г", description: "", price: 80 },

  // Салати
  { id: "salad-vegetable", category: "salads", name: "Салат Овочевий", weight: "200 г", description: "", composition: "Помідор, огірок, цибуля, олія", price: 160 },
  { id: "salad-olivier", category: "salads", name: "Салат Олів'є", weight: "200 г", description: "", composition: "Яйце, зелений горошок, яловичина, картопля, майонез", price: 200 },
  { id: "salad-greek", category: "salads", name: "Салат Грецький", weight: "200 г", description: "", composition: "Помідор, огірок, болгарський перець, сир, маслини", price: 180 },
  { id: "salad-caesar", category: "salads", name: "Салат Цезар", weight: "200 г", description: "", composition: "Капуста айсберг, копчене м'ясо, соус, сухарики, сир", price: 180 },
  { id: "salad-japanese", category: "salads", name: "Салат Японський", weight: "200 г", description: "", composition: "Яловичина, помідор, огірок, солодкий перець, зелень (два види)", price: 180 },
  { id: "salad-vitamin", category: "salads", name: "Салат Вітамінний", weight: "200 г", description: "", composition: "Капуста, морква, зелень", price: 160 },

  // Напої
  { id: "drink-ayran-02", category: "drinks", name: "Айран", weight: "0,2 л", description: "", price: 40 },
  { id: "drink-ayran-05", category: "drinks", name: "Айран", weight: "0,5 л", description: "", price: 60 },
  { id: "drink-pepsi-bottle", category: "drinks", name: "Пепсі", weight: "0,5 л, пляшка", description: "", price: 50 },
  { id: "drink-pepsi-can", category: "drinks", name: "Пепсі", weight: "банка", description: "", price: 50 },
  { id: "drink-pepsi-glass", category: "drinks", name: "Пепсі", weight: "скло", description: "", price: 50 },
  { id: "drink-uzvar", category: "drinks", name: "Узвар", weight: "0,5 л", description: "", price: 50 },
];

export const productById = new Map(products.map((p) => [p.id, p]));
