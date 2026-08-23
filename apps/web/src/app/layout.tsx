import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
      <body className="antialiased bg-[#0B0F17] text-slate-100 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}
