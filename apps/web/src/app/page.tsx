"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { socketManager } from "@/lib/phoenix-socket";
import { Account, Voucher, AuditLog, MizanReport } from "@/types";
import { 
  Wallet, 
  Landmark, 
  TrendingUp, 
  Receipt, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ShoppingCart,
  Layers,
  Handshake,
  Boxes,
  Users,
  Target,
  FileSpreadsheet,
  Briefcase
} from "lucide-react";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [mizan, setMizan] = useState<MizanReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accs, vchs, mzn, logs] = await Promise.all([
        api.getAccounts(),
        api.getVouchers(),
        api.getMizan(),
        api.getAuditLogs(),
      ]);
      setAccounts(accs);
      setVouchers(vchs);
      setMizan(mzn);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to WebSocket events for real-time live refresh
    const unsubscribePosted = socketManager.subscribe("voucher_posted", () => {
      loadData();
    });

    return () => {
      unsubscribePosted();
    };
  }, []);

  const getAccountBalance = (code: string) => {
    const acc = accounts.find((a) => a.code === code);
    return acc ? acc.balance : "0.00";
  };

  const kasaBal = getAccountBalance("100");
  const bankaBal = getAccountBalance("102");
  const satisBal = getAccountBalance("600");
  const stokBal = getAccountBalance("153");

  return (
    <div className="space-y-8">
      {/* ERP & CRM Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 lg:p-8 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60 border border-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Handshake className="w-3.5 h-3.5" />
              <span>LedgerERP & CRM Enterprise Suite</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Kurumsal ERP, CRM & Finans Yönetim Platformu
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Müşteri ilişkileri (CRM), stok ve depolama, atomik muhasebe fiş motoru (TDHP) ve gerçek zamanlı Elixir & Phoenix WebSocket mizan altyapısı.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/kasiyer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasiyer / POS Terminali</span>
            </Link>

            <Link
              href="/fisler"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Muhasebe Fişi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ERP & CRM KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CRM Müşteri & Cari Portföyü */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">CRM AKTİF MÜŞTERİ HESAPLARI</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              120 ALICILAR
            </div>
            <div className="mt-2 flex items-center text-[11px] text-blue-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Cari Kartlar & Müşteri Portföyü</span>
            </div>
          </div>
        </div>

        {/* ERP Stok & Varlıklar (153) */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">153 TİCARİ MALLAR (STOK)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              ₺{parseFloat(stokBal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-[11px] text-purple-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Depo ve Stok Varlıkları (Borç)</span>
            </div>
          </div>
        </div>

        {/* 100 Kasa Varlığı */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">100 KASA HESABI</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              ₺{parseFloat(kasaBal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-[11px] text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Nakit Kasa Varlığı</span>
            </div>
          </div>
        </div>

        {/* 600 Satış Gelirleri */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">600 YURTİÇİ SATIŞLAR</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              ₺{parseFloat(satisBal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-[11px] text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Brüt Satış Ciro Toplamı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main ERP & CRM Modules Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Muhasebe & CRM Fiş Hareketleri (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Son Muhasebe & CRM İşlemleri</h2>
            </div>
            <Link href="/fisler" className="text-xs font-medium text-blue-400 hover:underline">
              Tüm Fişleri Gör →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">ERP verileri yükleniyor...</div>
          ) : vouchers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">Henüz fiş kaydı bulunmamaktadır.</div>
          ) : (
            <div className="space-y-3">
              {vouchers.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        v.voucher_type === "FA"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : v.voucher_type === "ÖD"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {v.voucher_type}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{v.voucher_number}</div>
                      <div className="text-[11px] text-slate-400">{v.description || "Açıklama girilmedi"}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      ₺{parseFloat(v.total_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      {v.status === "posted" ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Nakledildi
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-amber-400 font-semibold">
                          <Clock className="w-3 h-3 mr-0.5" /> Taslak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log / Denetim Günlüğü & CRM Etkinlikleri (1 Column) */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Sistem Denetim Kayıtları (Audit)</h2>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-indigo-300">{log.entity_type} #{log.entity_id}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[9px]">
                    {log.action}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Aktör: <span className="text-slate-200">{log.actor}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {new Date(log.inserted_at).toLocaleString("tr-TR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
