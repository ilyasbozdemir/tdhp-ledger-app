"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/types";
import { Boxes, Package, ShoppingCart, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function StokPage() {
  const [stokAccounts, setStokAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const accs = await api.getAccounts();
      // Filter 15 Class stock accounts (153 Ticari Mallar, 157 Diğer Stoklar)
      setStokAccounts(accs.filter((a) => a.code.startsWith("15")));
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
            <Boxes className="w-5 h-5 text-purple-500" />
            <span>Stok, Ürün & Depo Katmanı (Inventory & Warehouse)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            153 Ticari Mallar, Depo Transferleri ve POS Terminal Entegrasyonu.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/kasiyer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasiyer POS Ekranı</span>
          </Link>
        </div>
      </div>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Stock Items Grid */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Package className="w-4 h-4 text-purple-500" />
            <span>153 Ticari Mallar & Stok Varlıkları</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">TDHP 15 Grubu</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Stoklar yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stokAccounts.map((acc) => (
              <div key={acc.id} className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {acc.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Borç Bakiyesi (D)
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Genel Stok Defter Değeri
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Stok Toplamı:</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    ₺{parseFloat(acc.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
