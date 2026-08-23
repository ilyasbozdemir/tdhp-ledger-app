"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Voucher } from "@/types";
import { CreditCard, Receipt, Wallet, Landmark, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function OdemelerPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getVouchers();
      // Filter payment and collection vouchers (ÖD, TH, FA)
      setVouchers(data.filter((v) => ["ÖD", "TH", "FA"].includes(v.voucher_type)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span>Ödeme & Tahsilat Katmanı (Payments & Collection)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            100 Kasa, 102 Banka, ÖÖ Ödeme ve TH Tahsilat Fişleri Yönetimi.
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md transition-all">
          <Plus className="w-4 h-4" />
          <span>Hızlı Ödeme / Tahsilat Kaydı</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">100 KASA TAHSİLATLARI</span>
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₺14.250,00</div>
          <div className="flex items-center text-xs text-emerald-500">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>Nakit Kasa Girişleri (TH Fişleri)</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">102 BANKA ÖDEMELERİ</span>
            <Landmark className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₺8.600,00</div>
          <div className="flex items-center text-xs text-rose-500">
            <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
            <span>Banka Çıkışları (ÖD Fişleri)</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">NET FİNANSAL AKIŞ</span>
            <Receipt className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₺5.650,00</div>
          <div className="flex items-center text-xs text-blue-500">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>Pozitif Dönem Akışı</span>
          </div>
        </div>
      </div>

      {/* Process Timeline Visualizer */}
      <ProcessTimeline />

      {/* Payments Voucher List Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Son Ödeme & Tahsilat Fişleri</h2>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Fişler yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3">Fiş No</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Açıklama</th>
                  <th className="p-3 text-right">Tutar (TL)</th>
                  <th className="p-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{v.voucher_number}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.voucher_type === "TH" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      }`}>
                        {v.voucher_type === "TH" ? "Tahsilat" : "Ödeme"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{v.date}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{v.description || "Açıklama yok"}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₺{parseFloat(v.total_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold">
                        {v.status === "posted" ? "Nakledildi" : "Taslak"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
