"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/types";
import { ShieldAlert, FolderTree, Landmark, Plus } from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function EmanetPage() {
  const [emanetAccounts, setEmanetAccounts] = useState<Account[]>([]);
  const [nazimAccounts, setNazimAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const accs = await api.getAccounts();
      // Filter 330 Emanetler & Class 9 Nazım Accounts
      setEmanetAccounts(accs.filter((a) => a.code.startsWith("33")));
      setNazimAccounts(accs.filter((a) => a.class_no === 9));
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
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            <span>Emanet & Nazım Hesaplar Katmanı (Kamu & Teminat)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            330 Emanet Hesaplar, Teminat ve 9. Sınıf Bilgilendirme Nazım Hesapları.
          </p>
        </div>
      </div>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Public Sector Deposits & Nazım Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 330 Emanetler */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-indigo-500" />
              <span>Emanet Hesaplar (330 / 333)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Kamu Desteği</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Emanet hesaplar yükleniyor...</div>
          ) : emanetAccounts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">Emanet kaydı bulunmamaktadır.</div>
          ) : (
            <div className="space-y-3">
              {emanetAccounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{acc.code} - {acc.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Emanet Alacak Bakiyesi (C)</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ₺{parseFloat(acc.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. Sınıf Nazım Hesaplar */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-cyan-500" />
              <span>9. Sınıf Nazım Hesaplar (Teminatlar)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Bilgi Hesapları</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Nazım hesaplar yükleniyor...</div>
          ) : (
            <div className="space-y-3">
              {nazimAccounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{acc.code} - {acc.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Nazım Bilgi Kaydı</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    ₺{parseFloat(acc.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
