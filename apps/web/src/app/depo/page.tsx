"use client";

import { useState } from "react";
import { Boxes, Package, ArrowLeftRight, Plus, Building2, MapPin } from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function DepoPage() {
  const [warehouses] = useState([
    { id: 1, name: "Merkez Ana Depo", code: "DEP-01", location: "İstanbul Anadolu (Tuzla)", capacity: "%78", items: "1.450 Çeşit" },
    { id: 2, name: "Şube Mağaza Deposu", code: "DEP-02", location: "İstanbul Avrupa (Karaköy)", capacity: "%62", items: "680 Çeşit" },
    { id: 3, name: "Ankara Bölge Lojistik Depo", code: "DEP-03", location: "Ankara OSTİM", capacity: "%45", items: "920 Çeşit" },
  ]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-purple-500" />
            <span>ERP Depo & Şube Transfer Katmanı (Warehouse & Logistics)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Depolar Arası Transfer, Şube Stok Giriş/Çıkış ve Lojistik Yönetimi.
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all">
          <ArrowLeftRight className="w-4 h-4" />
          <span>Depo Transfer Fişi Oluştur</span>
        </button>
      </div>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Warehouses Grid */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            <span>Aktif Depolar & Şubeler</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">3 Şube Deposu</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {warehouses.map((w) => (
            <div key={w.id} className="glass-card rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-4 hover:border-purple-500/40">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {w.code}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Doluluk: {w.capacity}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{w.name}</h3>
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{w.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                <span>Stok Çeşidi:</span>
                <span className="font-bold">{w.items}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
