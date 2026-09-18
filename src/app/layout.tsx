import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bozor-Analitika | B2B Savdo Platformasi",
  description:
    "Uzbekiston uchun sun'iy intellekt asosidagi B2B savdo tahlili va buyurtma moslashtirish platformasi.",
  keywords: ["b2b", "savdo", "uzbekistan", "bozor", "analitika", "supplier"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
