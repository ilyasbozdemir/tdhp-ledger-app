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
  ShieldAlert,
  CreditCard,
  Building,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Package,
  Boxes,
  Handshake,
  Target,
  FileSpreadsheet
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainModules: MainMenuModule[] = [
    {
      id: "crm",
      name: "CRM & Müşteri Yönetimi",
      icon: Handshake,
      subMenus: [
        { name: "Genel Bakış (Dashboard)", href: "/", icon: LayoutDashboard },
        { name: "Müşteri Portföyü (120)", href: "/defterler", icon: Building, badge: "Cari" },
        { name: "Tedarikçiler (320)", href: "/defterler", icon: Building2 },
        { name: "Satış Fırsatları & Pipeline", href: "/", icon: Target, badge: "Fırsatlar" },
        { name: "Teklif & Sözleşme Yönetimi", href: "/fisler", icon: FileSpreadsheet },
      ],
    },
    {
      id: "inventory",
      name: "Stok & Tedarik Zinciri",
      icon: Boxes,
      subMenus: [
        { name: "Kasiyer POS Terminali", href: "/kasiyer", icon: ShoppingCart, badge: "Hızlı POS" },
        { name: "Stok & Ürün Kartları (153)", href: "/hesap-plani", icon: Package, badge: "Stok" },
        { name: "Depo & Şube Hareketleri", href: "/defterler", icon: Boxes },
      ],
    },
    {
      id: "accounting",
      name: "Genel Muhasebe & Finans",
      icon: Layers,
      subMenus: [
        { name: "TDHP Hesap Planı", href: "/hesap-plani", icon: FolderTree, badge: "9 Sınıf" },
        { name: "Mahsup & Fiş İşlemleri", href: "/fisler", icon: FileText, badge: "Atomik" },
        { name: "Ödeme & Tahsilat Fişleri", href: "/fisler", icon: CreditCard },
        { name: "100 Kasa Defteri", href: "/defterler", icon: Wallet },
        { name: "102 Banka Defteri", href: "/defterler", icon: Landmark },
      ],
    },
    {
      id: "public",
      name: "Emanet & Teminat (Kamu)",
      icon: ShieldAlert,
      subMenus: [
        { name: "Emanet Hesapları (330)", href: "/hesap-plani", icon: ShieldAlert, badge: "Kamu" },
        { name: "Teminat & Nazım (9. Sınıf)", href: "/hesap-plani", icon: FolderTree, badge: "Nazım" },
      ],
    },
    {
      id: "hr",
      name: "İK & Bordro Yönetimi",
      icon: Users,
      subMenus: [
        { name: "Personel & Kasiyer Kartları", href: "/defterler", icon: UserCheck },
        { name: "Personele Borçlar (335)", href: "/defterler", icon: Briefcase, badge: "Bordro" },
      ],
    },
    {
      id: "reports",
      name: "Mali Raporlar & Analiz",
      icon: BarChart3,
      subMenus: [
        { name: "Canlı Mizan", href: "/mizan", icon: Zap, badge: "WebSocket" },
        { name: "Defter-i Kebir (Büyük Defter)", href: "/defterler", icon: BookOpen },
        { name: "Muavin (Cari) Defter", href: "/defterler", icon: Users },
        { name: "KDV Mahsuplaştırması", href: "/mizan", icon: Receipt },
        { name: "Gelir Tablosu", href: "/mizan", icon: TrendingUp },
        { name: "Bilanço", href: "/mizan", icon: PieChart },
      ],
    },
  ];

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

  const handleModuleClick = (modId: string) => {
    setActiveModuleId(modId);
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <div className="flex h-screen sticky top-0 shrink-0 border-r border-white/10 z-40 transition-all duration-300">
      {/* 1. Primary Left Icon Rail */}
      <aside className="w-16 bg-[#0E1420] flex flex-col items-center justify-between py-4 border-r border-white/10 shrink-0 z-10">
        <div className="space-y-6 flex flex-col items-center">
          {/* ERP Brand Logo Icon */}
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
            title="LedgerERP & CRM Cloud"
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
                  onClick={() => handleModuleClick(mod.id)}
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

        {/* Bottom Actions: Collapse Toggle & Live WebSocket Badge */}
        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          <div
            className={`w-3 h-3 rounded-full border-2 border-slate-900 ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`}
            title={isConnected ? "Elixir Phoenix Engine Canlı" : "API Bekleniyor"}
          />
        </div>
      </aside>

      {/* 2. Secondary Sub-Menu Panel (Collapsible) */}
      <aside
        className={`glass-panel flex flex-col justify-between p-4 overflow-y-auto transition-all duration-300 ${
          isCollapsed
            ? "w-0 opacity-0 p-0 border-none pointer-events-none"
            : "w-64 opacity-100"
        }`}
      >
        <div className="space-y-5">
          {/* Active Main Module Header */}
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div className="truncate">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                ERP / CRM Modülü
              </div>
              <h2 className="text-xs font-bold text-white flex items-center space-x-2 truncate">
                <activeModule.icon className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{activeModule.name}</span>
              </h2>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5"
              title="Daralt"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-menu List */}
          <nav className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Alt Modüller & Ekranlar
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
                      ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white font-bold shadow-md shadow-blue-600/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                    <span className="truncate">{sub.name}</span>
                  </div>

                  {sub.badge ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
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
            <div className="text-[10px] text-slate-400 font-semibold">LedgerERP & CRM Cloud</div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Elixir TDHP Finans Motoru</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
