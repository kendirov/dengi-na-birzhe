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
    default: "Деньги на бирже — скринер инструментов",
    template: "%s | Деньги на бирже",
  },
  description:
    "Интерактивное пособие для практикующих трейдеров: отбор акций, стакан, лента, плотности и риск.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Деньги на бирже — скринер инструментов",
    description:
      "Интерактивное пособие для практикующих трейдеров: отбор акций, стакан, лента, плотности и риск.",
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
      <body
        className="min-h-screen bg-terminal-bg text-terminal-text antialiased"
        style={{ backgroundColor: "#05070d", color: "#e2e8f0" }}
      >
        {children}
      </body>
    </html>
  );
}
