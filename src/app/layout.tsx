import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "e-Bozor | B2B Savdo Platformasi",
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
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
