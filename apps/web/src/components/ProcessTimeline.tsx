"use client";

import { 
  Handshake, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function ProcessTimeline() {
  const steps = [
    {
      id: 1,
      title: "1. CRM & Satış Teklifi",
      sub: "Müşteri İletişimi & Fırsat",
      icon: Handshake,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-400",
      status: "Tamamlandı",
      detail: "120.01 ABC A.Ş. Cari Kartı ve Teklif Fişi Oluşturuldu."
    },
    {
      id: 2,
      title: "2. POS & Satış Siparişi",
      sub: "Kasiyer POS Terminali",
      icon: ShoppingCart,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-400",
      status: "Tamamlandı",
      detail: "153 Stok Düşümü + 600 Satış Gelir Fişi Tetiklendi."
    },
    {
      id: 3,
      title: "3. Ödeme / Tahsilat (TH)",
      sub: "100 Kasa / 102 Banka",
      icon: CreditCard,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-400",
      status: "İşleniyor",
      detail: "Tahsilat Fişi Kesildi (100 Kasa Borç / 120 Müşteri Alacak)."
    },
    {
      id: 4,
      title: "4. Elixir Ecto.Multi Nakil",
      sub: "Atomik Muhasebe Fişi",
      icon: FileText,
      color: "from-purple-500 to-violet-600",
      textColor: "text-purple-400",
      status: "Atomik Onaylı",
      detail: "Borç=Alacak Denge Kontrolü Yapılarak Veritabanına Yazıldı."
    },
    {
      id: 5,
      title: "5. Canlı Mizan Güncellemesi",
      sub: "Phoenix WebSocket Channel",
      icon: Zap,
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-400",
      status: "Canlı Yansıma",
      detail: "Admin Panellerindeki Canlı Mizana Anlık Yansıtıldı."
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Uçtan Uca İşlem Süreç İzleyici (End-to-End Workflow)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bir CRM teklifinden satışa, tahsilata, Elixir atomik fiş kaydına ve canlı mizan yansımasına kadar tüm sürecin izlenmesi.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center space-x-1.5 self-start md:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span>Süreç Tam Doğrulandı</span>
        </div>
      </div>

      {/* Steps Flow Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-3 relative group hover:border-blue-500/40"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${step.color} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${step.textColor} bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10`}>
                  {step.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{step.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{step.sub}</p>
              </div>

              <div className="text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-2 leading-relaxed">
                {step.detail}
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
