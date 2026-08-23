"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  FolderTree, 
  BookOpen, 
  BarChart3, 
  Zap,
  Building2
} from "lucide-react";
import { useEffect, useState } from "react";
import { socketManager } from "@/lib/phoenix-socket";

export default function Navigation() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      socketManager.connect();
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  const navItems = [
    { name: "Genel Bakış", href: "/", icon: LayoutDashboard },
    { name: "Kasiyer / POS", href: "/kasiyer", icon: ShoppingCart },
    { name: "Fiş Motoru", href: "/fisler", icon: FileText },
    { name: "TDHP Hesap Planı", href: "/hesap-plani", icon: FolderTree },
    { name: "Defterler", href: "/defterler", icon: BookOpen },
    { name: "Mizan & Raporlar", href: "/mizan", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                TDHP Ledger
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Elixir Core
              </span>
            </div>
            <p className="text-xs text-slate-400">Tek Düzen Hesap Planı Engine</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/90 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Phoenix Socket Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-slate-300 font-mono text-[11px] flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{isConnected ? "Elixir WebSocket Canlı" : "Bağlantı Bekleniyor..."}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden flex items-center justify-around mt-3 pt-2 border-t border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg text-[10px] ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400"
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
