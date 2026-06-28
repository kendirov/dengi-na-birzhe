import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Лаборатория рынка | Market Lab",
    template: "%s | Market Lab",
  },
  description:
    "Интерактивное обучение внутридневной торговле на MOEX: скринер, параметры инструмента, уроки. Не инвестиционная рекомендация.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Лаборатория рынка",
    description:
      "Скринер и уроки для выбора акций по спреду, лоту и ликвидности.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
