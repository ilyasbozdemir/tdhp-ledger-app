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
  ChevronRight,
  Receipt,
  Users,
  Wallet,
  Landmark,
  TrendingUp,
  PieChart,
  Layers,
  ChevronDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { socketManager } from "@/lib/phoenix-socket";

interface SubMenuItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface MainMenuModule {
  id: string;
  name: string;
  icon: any;
  subMenus: SubMenuItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);

  const mainModules: MainMenuModule[] = [
    {
      id: "finans",
      name: "Finans & Muhasebe",
      icon: Layers,
      subMenus: [
        { name: "Genel Bakış", href: "/", icon: LayoutDashboard },
        { name: "TDHP Hesap Planı", href: "/hesap-plani", icon: FolderTree, badge: "9 Sınıf" },
        { name: "Muhasebe Fişleri", href: "/fisler", icon: FileText, badge: "Ecto.Multi" },
      ],
    },
    {
      id: "pos",
      name: "Satış & Kasiyer POS",
      icon: ShoppingCart,
      subMenus: [
        { name: "Kasiyer POS Ekranı", href: "/kasiyer", icon: ShoppingCart, badge: "Canlı" },
      ],
    },
    {
      id: "defterler",
      name: "Resmi Defterler",
      icon: BookOpen,
      subMenus: [
        { name: "Defter-i Kebir", href: "/defterler", icon: BookOpen },
        { name: "Muavin (Cari) Defter", href: "/defterler", icon: Users },
        { name: "100 Kasa Defteri", href: "/defterler", icon: Wallet },
        { name: "102 Banka Defteri", href: "/defterler", icon: Landmark },
      ],
    },
    {
      id: "mizan",
      name: "Mizan & Finansal Tablolar",
      icon: BarChart3,
      subMenus: [
        { name: "Canlı Mizan", href: "/mizan", icon: Zap, badge: "WebSocket" },
        { name: "KDV Mahsuplaştırma", href: "/mizan", icon: Receipt },
        { name: "Gelir Tablosu", href: "/mizan", icon: TrendingUp },
        { name: "Bilanço", href: "/mizan", icon: PieChart },
      ],
    },
  ];

  // Determine active main module based on URL pathname
  const initialActiveModule = mainModules.find((m) =>
    m.subMenus.some((s) => s.href === pathname)
  )?.id || mainModules[0].id;

  const [activeModuleId, setActiveModuleId] = useState<string>(initialActiveModule);

  useEffect(() => {
    try {
      socketManager.connect();
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    const matchingModule = mainModules.find((m) =>
      m.subMenus.some((s) => s.href === pathname)
    );
    if (matchingModule) {
      setActiveModuleId(matchingModule.id);
    }
  }, [pathname]);

  const activeModule = mainModules.find((m) => m.id === activeModuleId) || mainModules[0];

  return (
    <div className="flex h-screen sticky top-0 shrink-0 border-r border-white/10 z-40">
      {/* 1. Primary Left Icon Rail (Ana Menü İkon Sütunu) */}
      <aside className="w-16 bg-[#0E1420] flex flex-col items-center justify-between py-4 border-r border-white/10 shrink-0">
        <div className="space-y-6 flex flex-col items-center">
          {/* Logo Icon */}
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
            title="TDHP Ledger Engine"
          >
            <Building2 className="w-5 h-5 text-white" />
          </Link>

          {/* Main Module Icons */}
          <div className="space-y-2 flex flex-col items-center pt-2">
            {mainModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = activeModuleId === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={mod.name}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip on hover */}
                  <span className="absolute left-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">
                    {mod.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Phoenix WebSocket Connection Badge */}
        <div className="flex flex-col items-center space-y-1">
          <div
            className={`w-3 h-3 rounded-full border-2 border-slate-900 ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`}
            title={isConnected ? "Elixir WebSocket Canlı Bağlantı" : "API Bekleniyor"}
          />
        </div>
      </aside>

      {/* 2. Secondary Sub-Menu Panel (Seçili Ana Menünün Alt Menü Listesi) */}
      <aside className="w-56 glass-panel flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-5">
          {/* Active Main Module Header */}
          <div className="border-b border-white/10 pb-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Ana Modül
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center space-x-2 truncate">
                <activeModule.icon className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{activeModule.name}</span>
              </h2>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Sub-menu List */}
          <nav className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Alt Menüler
            </div>

            {activeModule.subMenus.map((sub, idx) => {
              const Icon = sub.icon;
              const isActive = pathname === sub.href;
              return (
                <Link
                  key={idx}
                  href={sub.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-blue-600/90 text-white font-bold shadow-md shadow-blue-600/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="truncate">{sub.name}</span>
                  </div>

                  {sub.badge ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {sub.badge}
                    </span>
                  ) : (
                    isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400 font-semibold">TDHP Motoru</div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Elixir & Phoenix API</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
