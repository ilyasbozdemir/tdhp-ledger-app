"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { socketManager } from "@/lib/phoenix-socket";
import { MizanReport, IncomeStatement, BalanceSheet, Voucher } from "@/types";
import { 
  BarChart3, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  PieChart, 
  Zap,
  Sparkles,
  Printer
} from "lucide-react";

export default function MizanAndReportsPage() {
  const [activeTab, setActiveTab] = useState<"mizan" | "income" | "balance">("mizan");
  const [mizan, setMizan] = useState<MizanReport | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [mahsupResult, setMahsupResult] = useState<{ voucher: Voucher; net_tax: string } | null>(null);
  const [runningMahsup, setRunningMahsup] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mzn, inc, bal] = await Promise.all([
        api.getMizan(),
        api.getIncomeStatement(),
        api.getBalanceSheet(),
      ]);
      setMizan(mzn);
      setIncomeStatement(inc);
      setBalanceSheet(bal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Live Phoenix WebSocket subscriber
    const unsubscribePosted = socketManager.subscribe("voucher_posted", () => {
      loadData();
    });

    return () => {
      unsubscribePosted();
    };
  }, []);

  const handleRunKdvMahsup = async () => {
    try {
      setRunningMahsup(true);
      const res = await api.runKdvMahsup();
      setMahsupResult({ voucher: res.voucher, net_tax: res.net_tax });
      await loadData();
    } catch (err: any) {
      alert("KDV Mahsubu Hatası: " + err.message);
    } finally {
      setRunningMahsup(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Canlı Mizan & Finansal Tablolar Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Canlı WebSocket Mizan Güncellemeleri, Otomatik KDV Mahsuplaştırması, Gelir Tablosu ve Bilanço.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunKdvMahsup}
            disabled={runningMahsup}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Receipt className="w-4 h-4" />
            <span>{runningMahsup ? "Mahsuplaştırılıyor..." : "Otomatik KDV Mahsubu Çalıştır (191 vs 391)"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab("mizan")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "mizan"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Canlı Mizan (Trial Balance)</span>
        </button>

        <button
          onClick={() => setActiveTab("income")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "income"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-300" />
          <span>Gelir Tablosu (Income Statement)</span>
        </button>

        <button
          onClick={() => setActiveTab("balance")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "balance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <PieChart className="w-4 h-4 text-blue-300" />
          <span>Bilanço (Balance Sheet)</span>
        </button>
      </div>

      {/* Tab 1: Live Mizan Table */}
      {activeTab === "mizan" && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3.5">Hesap Kodu</th>
                    <th className="px-6 py-3.5 font-sans">Hesap Adı</th>
                    <th className="px-6 py-3.5 font-sans">Sınıf</th>
                    <th className="px-6 py-3.5 text-right">Dönem Borç</th>
                    <th className="px-6 py-3.5 text-right">Dönem Alacak</th>
                    <th className="px-6 py-3.5 text-right">Kapanış Borç Bakiye</th>
                    <th className="px-6 py-3.5 text-right">Kapanış Alacak Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-sans">
                        Mizan verileri canlı çekiliyor...
                      </td>
                    </tr>
                  ) : mizan?.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-sans">
                        Hesap mizan kaydı bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    mizan?.rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          row.is_header ? "bg-slate-900/60 font-bold text-amber-300" : ""
                        }`}
                      >
                        <td className="px-6 py-3.5 font-bold text-white">{row.code}</td>
                        <td className="px-6 py-3.5 font-sans font-medium text-slate-200">{row.name}</td>
                        <td className="px-6 py-3.5 font-sans text-slate-400">Sınıf {row.class_no}</td>
                        <td className="px-6 py-3.5 text-right text-emerald-400 font-bold">
                          ₺{parseFloat(row.period_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3.5 text-right text-purple-400 font-bold">
                          ₺{parseFloat(row.period_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3.5 text-right text-emerald-300 font-bold">
                          {parseFloat(row.closing_debit) > 0
                            ? `₺${parseFloat(row.closing_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                        <td className="px-6 py-3.5 text-right text-purple-300 font-bold">
                          {parseFloat(row.closing_credit) > 0
                            ? `₺${parseFloat(row.closing_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Mizan Grand Totals */}
                {mizan && (
                  <tfoot className="bg-slate-900 border-t-2 border-amber-500/40 text-xs font-bold text-white">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 font-sans uppercase">GENEL TOPLAMLAR</td>
                      <td className="px-6 py-4 text-right text-emerald-400">
                        ₺{parseFloat(mizan.totals.p_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-400">
                        ₺{parseFloat(mizan.totals.p_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-300">
                        ₺{parseFloat(mizan.totals.c_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-300">
                        ₺{parseFloat(mizan.totals.c_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Income Statement (Gelir Tablosu) */}
      {activeTab === "income" && incomeStatement && (
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Gelir Tablosu Özeti (Dönem Satış ve İskontolar)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 block">600 BRÜT SATIŞLAR</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                ₺{parseFloat(incomeStatement.gross_sales).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 block">610 SATIŞTAN İADELER</span>
              <span className="text-lg font-bold text-rose-400 font-mono mt-1 block">
                ₺{parseFloat(incomeStatement.sales_returns).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 block">611 SATIŞ İSKONTOLARI</span>
              <span className="text-lg font-bold text-rose-400 font-mono mt-1 block">
                ₺{parseFloat(incomeStatement.sales_discounts).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="glass-card p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
              <span className="text-xs text-purple-300 font-semibold block">NET SATIŞ GELİRİ</span>
              <span className="text-xl font-bold text-purple-300 font-mono mt-1 block">
                ₺{parseFloat(incomeStatement.net_sales).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Balance Sheet (Bilanço) */}
      {activeTab === "balance" && balanceSheet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Assets (Varlıklar - Class 1 & 2) */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-emerald-400">AKTİF (VARLIKLAR - SINIF 1 & 2)</h3>
              <span className="text-xs font-mono font-bold text-white">
                ₺{parseFloat(balanceSheet.total_assets).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {balanceSheet.asset_rows.map((r) => (
                <div key={r.id} className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-300 font-sans">{r.code} - {r.name}</span>
                  <span className="font-bold text-emerald-400">
                    ₺{parseFloat(r.closing_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Liabilities & Equity (Pasif - Class 3, 4, 5) */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-purple-400">PASİF (KAYNAKLAR - SINIF 3, 4, 5)</h3>
              <span className="text-xs font-mono font-bold text-white">
                ₺{parseFloat(balanceSheet.total_liabilities).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {balanceSheet.liability_rows.map((r) => (
                <div key={r.id} className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-slate-300 font-sans">{r.code} - {r.name}</span>
                  <span className="font-bold text-purple-400">
                    ₺{parseFloat(r.closing_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KDV Mahsup Success Popup */}
      {mahsupResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-amber-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Otomatik KDV Mahsubu Tamamlandı</h3>
              <p className="text-xs text-slate-400">191 İndirilecek KDV ve 391 Hesaplanan KDV kapatıldı.</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Mahsup Fiş No:</span>
                <span className="font-bold text-white">{mahsupResult.voucher.voucher_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Ödenecek KDV (360):</span>
                <span className="font-bold text-amber-400">₺{parseFloat(mahsupResult.net_tax).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setMahsupResult(null)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg transition-colors"
            >
              Tamam ve Mizana Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
