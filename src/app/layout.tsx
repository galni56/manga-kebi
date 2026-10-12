import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductModal } from "@/components/ProductModal";

// Один шрифт на весь сайт — ієрархію тримаємо жирністю (600–800), а не другим шрифтом.
// Локальний файл (не next/font/google) — збірка не залежить від доступу до fonts.googleapis.com.
const montserrat = localFont({
  src: "../fonts/Montserrat-Variable.ttf",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Мангал і Казан (ЖК Чайки) — доставка плову, манти, лагману та кебабу",
  description:
    "Халяль кафе Мангал і Казан у ЖК Чайки: шашлик, люля-кебаб, плов, манти та лагман. Доставка по ЖК.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ProductModal />
      </body>
    </html>
  );
}
