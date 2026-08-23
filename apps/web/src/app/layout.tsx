import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "TDHP Ledger System | Tek Düzen Hesap Planı Engine",
  description: "Elixir Phoenix backend ve Next.js frontend ile gerçek zamanlı 9 sınıflı TDHP muhasebe ve defter yönetim platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased bg-[#0B0F17] text-slate-100 min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
