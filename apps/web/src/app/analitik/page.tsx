"use client";

import { BarChart3, TrendingUp, Zap, PieChart, ShieldCheck, ArrowUpRight } from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function AnalitikPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>ERP & CRM İş Zekası ve Analitik Katmanı (Business Intelligence)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nakit Akış Analizi, Ciro & Kârlılık Performansı, Bütçe ve Mizan İstatistikleri.
          </p>
        </div>
      </div>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Analytics KPI Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Dönem Net Kârlılık (600 - 610/611)</span>
            </h2>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₺342.850,00</div>
          <div className="text-xs text-emerald-500 flex items-center font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Geçen Aya Göre +%18.4 Artış</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>CRM Dönüşüm Oranı</span>
            </h2>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">%74,2</div>
          <div className="text-xs text-amber-500 flex items-center font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Fırsat / Satış Başarı Oranı</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              <span>Bilanço Aktif / Pasif Dengesi</span>
            </h2>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">Tam Dengede (D=C)</div>
          <div className="text-xs text-purple-500 flex items-center font-medium">
            <ShieldCheck className="w-4 h-4 mr-1" />
            <span>Elixir Ecto.Multi Atomik Doğrulamalı</span>
          </div>
        </div>
      </div>
    </div>
  );
}
