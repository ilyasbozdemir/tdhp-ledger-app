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
  Building2,
  ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { socketManager } from "@/lib/phoenix-socket";

export default function Sidebar() {
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
    { name: "Muhasebe Fişleri", href: "/fisler", icon: FileText },
    { name: "TDHP Hesap Planı", href: "/hesap-plani", icon: FolderTree },
    { name: "Defterler", href: "/defterler", icon: BookOpen },
    { name: "Mizan & Raporlar", href: "/mizan", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-white/10 flex flex-col justify-between p-4 min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                TDHP Ledger
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Tek Düzen Hesap Planı</p>
          </div>
        </Link>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigasyon
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md shadow-blue-600/20 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Phoenix Live Socket Status */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Phoenix Backend</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{isConnected ? "WebSocket Canlı" : "API Bekleniyor"}</span>
          </div>
        </div>

        <div className="text-[10px] text-center text-slate-400">
          Elixir Ecto & PostgreSQL Core
        </div>
      </div>
    </aside>
  );
}
