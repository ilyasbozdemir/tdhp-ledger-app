"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account, CurrentAccount, KebirLedger, LedgerEntry } from "@/types";
import { 
  BookOpen, 
  Wallet, 
  Landmark, 
  Users, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight
} from "lucide-react";

export default function LedgersPage() {
  const [activeTab, setActiveTab] = useState<"kebir" | "muavin" | "kasa" | "banka">("kebir");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedCurrentAccountId, setSelectedCurrentAccountId] = useState<number | null>(null);

  const [kebirData, setKebirData] = useState<KebirLedger | null>(null);
  const [muavinEntries, setMuavinEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getCurrentAccounts()]).then(([accs, curAccs]) => {
      setAccounts(accs);
      setCurrentAccounts(curAccs);

      if (accs.length > 0) setSelectedAccountId(accs[0].id);
      if (curAccs.length > 0) setSelectedCurrentAccountId(curAccs[0].id);
    });
  }, []);

  const loadKebir = async (accId: number) => {
    try {
      setLoading(true);
      const res = await api.getKebir(accId);
      setKebirData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMuavin = async (curAccId: number) => {
    try {
      setLoading(true);
      const res = await api.getMuavin(curAccId);
      setMuavinEntries(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKasa = async () => {
    try {
      setLoading(true);
      const res = await api.getKasaLedger();
      setKebirData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBanka = async () => {
    try {
      setLoading(true);
      const res = await api.getBankaLedger();
      setKebirData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "kebir" && selectedAccountId) {
      loadKebir(selectedAccountId);
    } else if (activeTab === "muavin" && selectedCurrentAccountId) {
      loadMuavin(selectedCurrentAccountId);
    } else if (activeTab === "kasa") {
      loadKasa();
    } else if (activeTab === "banka") {
      loadBanka();
    }
  }, [activeTab, selectedAccountId, selectedCurrentAccountId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Defterler (Defter-i Kebir, Muavin, Kasa, Banka)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hesap bazlı kronolojik fiş hareketleri ve yürüyen bakiye takibi.
          </p>
        </div>
      </div>

      {/* Ledger Navigation Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab("kebir")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "kebir"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Defter-i Kebir</span>
        </button>

        <button
          onClick={() => setActiveTab("muavin")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "muavin"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Muavin (Cari) Defter</span>
        </button>

        <button
          onClick={() => setActiveTab("kasa")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "kasa"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>100 Kasa Defteri</span>
        </button>

        <button
          onClick={() => setActiveTab("banka")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "banka"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>102 Banka Defteri</span>
        </button>
      </div>

      {/* Selector dropdown for Kebir and Muavin */}
      {activeTab === "kebir" && (
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-300">Hesap Seçimi:</label>
          <select
            value={selectedAccountId || ""}
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.name} ({a.normal_side})
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "muavin" && (
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-300">Cari Hesap Seçimi:</label>
          <select
            value={selectedCurrentAccountId || ""}
            onChange={(e) => setSelectedCurrentAccountId(Number(e.target.value))}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {currentAccounts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title} ({c.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ledger Entries Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Tarih</th>
                <th className="px-6 py-3.5">Fiş No</th>
                <th className="px-6 py-3.5">Açıklama</th>
                <th className="px-6 py-3.5 text-right">Borç (TL)</th>
                <th className="px-6 py-3.5 text-right">Alacak (TL)</th>
                <th className="px-6 py-3.5 text-right">Yürüyen Bakiye</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans">
                    Defter hareketleri yükleniyor...
                  </td>
                </tr>
              ) : activeTab === "muavin" ? (
                muavinEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans">
                      Bu cari hesaba ait hareket bulunamadı.
                    </td>
                  </tr>
                ) : (
                  muavinEntries.map((e) => (
                    <tr key={e.line_id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-slate-300">{e.date}</td>
                      <td className="px-6 py-4 font-bold text-white">{e.voucher_number}</td>
                      <td className="px-6 py-4 font-sans text-slate-300">{e.description || "-"}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        ₺{parseFloat(e.debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-purple-400">
                        ₺{parseFloat(e.credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        ₺{parseFloat(e.running_balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )
              ) : kebirData?.entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans">
                    Bu hesaba ait nakledilmiş hareket bulunamadı.
                  </td>
                </tr>
              ) : (
                kebirData?.entries.map((e) => (
                  <tr key={e.line_id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 text-slate-300">{e.date}</td>
                    <td className="px-6 py-4 font-bold text-white">{e.voucher_number}</td>
                    <td className="px-6 py-4 font-sans text-slate-300">{e.description || "-"}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ₺{parseFloat(e.debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-purple-400">
                      ₺{parseFloat(e.credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      ₺{parseFloat(e.running_balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
