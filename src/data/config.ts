// Усі значення з позначкою TODO — заглушки, їх треба замінити на реальні.
export const cafe = {
  name: "Мангал і Казан",
  place: "ЖК Чайки",
  phone: "+38 (068) 831-91-39",
  phoneHref: "tel:+380688319139",
  // TODO: підтвердити написання вулиці — "Лабановського" в оригіналі, тут виправлено на поширений варіант "Лобановського".
  address: "ЖК «Чайки», вул. Валерія Лобановського, 35, корпус 9",
  timezone: "Europe/Kyiv",
  hours: { open: 10, close: 20 },
  // Гриль (шашлик, люля-кебаб) готують тільки до цього часу, решта меню — до закриття.
  // enabled: false — перевірка й попередження вимкнені, але весь код лишається:
  // поставте true, коли знову знадобиться обмежувати гриль окремим часом.
  mangalCutoff: { hour: 19, minute: 30, enabled: false },
  // Показується на картці страви, якщо в Google Таблиці "В наявності" = ні, а свій коментар не вписали.
  defaultUnavailableNote: "Немає в наявності. Уже їдемо за продуктами!",
  minOrder: 200, // TODO: мінімальне замовлення, грн
  // Запасне значення: основне береться з Google Таблиці (рядок категорії "Налаштування",
  // дивись src/lib/menu-source.ts), якщо його там вписали.
  deliveryFee: 60,
  deliveryTimeLabel: "30–45 хв",
  // Доставка тільки по ЖК: клієнт вибирає вулицю зі списку.
  streets: ["вул. Валерія Лобановського"],
} as const;

export const workingHoursLabel = `${String(cafe.hours.open).padStart(2, "0")}:00 – ${String(cafe.hours.close).padStart(2, "0")}:00`;
export const mangalCutoffLabel = `${String(cafe.mangalCutoff.hour).padStart(2, "0")}:${String(cafe.mangalCutoff.minute).padStart(2, "0")}`;
