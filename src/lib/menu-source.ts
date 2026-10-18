import { cache } from "react";
import { categories, products as fallbackProducts, type Product } from "@/data/menu";
import { defaultDelivery, type DeliverySettings } from "@/lib/order";

// Джерело меню для сайту. Якщо задано MENU_SHEET_CSV_URL (посилання на CSV-експорт
// опублікованої Google Таблиці) — тягнемо ціни/наявність звідти, з кешем на 2 хвилини.
// Немає змінної, таблиця недоступна або її не вдалось розпізнати — тихо повертаємось
// до вбудованого меню з @/data/menu, сайт ніколи не лишається без меню через це.

const CATEGORY_ID_BY_NAME = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));

function slug(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/['"]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function isYes(v: string | undefined): boolean {
  return (v ?? "").trim().toLowerCase() === "так";
}
function isNo(v: string | undefined): boolean {
  return (v ?? "").trim().toLowerCase() === "ні";
}

/** Мінімальний CSV-парсер: лапки, екрановані лапки "", коми й переноси рядків усередині полів. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function parseProducts(rows: string[][]): Product[] {
  const [header, ...data] = rows;
  if (!header) return [];
  const idx = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  const i = {
    category: idx("Категорія"),
    name: idx("Назва"),
    weight: idx("Вага"),
    composition: idx("Склад"),
    price: idx("Ціна (грн)"),
    popular: idx("Хіт"),
    grill: idx("Гриль (до 19:30)"),
    available: idx("В наявності"),
    note: idx("Коментар при відсутності"),
  };
  if (i.category < 0 || i.name < 0 || i.price < 0) return [];

  const products: Product[] = [];
  for (const r of data) {
    const categoryName = (r[i.category] ?? "").trim();
    const categoryId = CATEGORY_ID_BY_NAME.get(categoryName.toLowerCase());
    const name = (r[i.name] ?? "").trim();
    if (!categoryId || !name) continue; // рядок без відомої категорії або назви — пропускаємо

    const weight = (r[i.weight] ?? "").trim();
    const priceNum = Number((r[i.price] ?? "").replace(",", ".").trim());
    const hasValidPrice = Number.isFinite(priceNum) && priceNum > 0;

    products.push({
      id: `${categoryId}--${slug(name, weight)}`,
      category: categoryId,
      name,
      weight,
      description: "",
      composition: (r[i.composition] ?? "").trim() || undefined,
      price: hasValidPrice ? priceNum : 0,
      popular: isYes(r[i.popular]),
      grill: isYes(r[i.grill]),
      // Немає валідної ціни — страву ховаємо, навіть якщо "В наявності" не заповнили.
      available: hasValidPrice && !isNo(r[i.available]),
      unavailableNote: (r[i.note] ?? "").trim() || (hasValidPrice ? undefined : "Ціну ще не вказали"),
    });
  }
  return products;
}

// Вартість доставки — звичайний рядок у тій самій таблиці меню:
//   Категорія = "Налаштування", Назва = "Доставка", Ціна (грн) = 60
// parseProducts такі рядки пропускає (категорії "Налаштування" в меню немає).
// Рядка немає або число некоректне — береться значення з config.ts.
function parseDelivery(rows: string[][]): DeliverySettings {
  const [header, ...data] = rows;
  const result = { ...defaultDelivery };
  if (!header) return result;
  const idx = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  const iCategory = idx("Категорія");
  const iName = idx("Назва");
  const iValue = idx("Ціна (грн)");
  if (iCategory < 0 || iName < 0 || iValue < 0) return result;

  for (const r of data) {
    if ((r[iCategory] ?? "").trim().toLowerCase() !== "налаштування") continue;
    const name = (r[iName] ?? "").trim().toLowerCase();
    const value = Number((r[iValue] ?? "").replace(",", ".").trim());
    if (!Number.isFinite(value) || value < 0 || (r[iValue] ?? "").trim() === "") continue;
    if (name === "доставка") result.fee = value;
  }
  return result;
}

type Menu = { products: Product[]; categories: typeof categories; delivery: DeliverySettings };

export const getMenu = cache(async (): Promise<Menu> => {
  const fallback: Menu = { products: fallbackProducts, categories, delivery: defaultDelivery };
  const url = process.env.MENU_SHEET_CSV_URL;
  if (!url) return fallback;

  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`Google Sheets CSV: ${res.status}`);
    const rows = parseCsv(await res.text());
    const products = parseProducts(rows);
    if (products.length === 0) throw new Error("Порожній або нерозпізнаний CSV");
    return { products, categories, delivery: parseDelivery(rows) };
  } catch (e) {
    console.error("Не вдалося завантажити меню з Google Таблиці, показую вбудоване меню", e);
    return fallback;
  }
});
