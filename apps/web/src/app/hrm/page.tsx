"use client";

import { useState } from "react";
import { Users, UserCheck, Briefcase, Plus, Calendar, DollarSign, Award, ChevronRight } from "lucide-react";

export default function HrmPage() {
  const [personnel] = useState([
    { id: 1, name: "Ahmet Yılmaz", role: "Kasiyer / POS Sorumlusu", dept: "Satış & Mağaza", salary: "32.500 ₺", code: "335.01", status: "Aktif" },
    { id: 2, name: "Ayşe Kaya", role: "Baş Muhasebeci", dept: "Finans & Muhasebe", salary: "55.000 ₺", code: "335.02", status: "Aktif" },
    { id: 3, name: "Mehmet Demir", role: "Depo ve Lojistik Yöneticisi", dept: "Depo & Stok", salary: "42.000 ₺", code: "335.03", status: "Aktif" },
    { id: 4, name: "Zeynep Çelik", role: "Müşteri Temsilcisi", dept: "CRM & Satış", salary: "38.000 ₺", code: "335.04", status: "İzinde" },
  ]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>HRM & İnsan Kaynakları Yönetim Katmanı (Human Resource Management)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personel Kartları, Avans İşlemleri, Maaş Bordrolama ve 335 Personele Borçlar Entegrasyonu.
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all">
          <Plus className="w-4 h-4" />
          <span>Yeni Personel Kaydı</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>TOPLAM PERSONEL</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">24 Kişi</div>
          <div className="text-[11px] text-indigo-500 font-medium">4 Aktif Departman</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>AYLIK BORDRO TOPLAMI</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">₺985.400,00</div>
          <div className="text-[11px] text-emerald-500 font-medium">335 Hesap Taahhüdü</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>AKTİF İZİNLİLER</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">2 Personel</div>
          <div className="text-[11px] text-amber-500 font-medium">Yıllık İzin Sürecinde</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>PERFORMANS ORTALAMASI</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">%94,8</div>
          <div className="text-[11px] text-purple-500 font-medium">Yüksek Verimlilik</div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <span>Personel Kadrosu & Bordro Detayları</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">TDHP 335 Hesabı</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="p-3">Hesap Kodu</th>
                <th className="p-3">Personel Adı</th>
                <th className="p-3">Unvan / Görev</th>
                <th className="p-3">Departman</th>
                <th className="p-3 text-right">Net Maaş</th>
                <th className="p-3 text-center">Durum</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {personnel.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.code}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{p.role}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{p.dept}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.salary}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === "Aktif" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs inline-flex items-center space-x-1">
                      <span>Bordro Gör</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
