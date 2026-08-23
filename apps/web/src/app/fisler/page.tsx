"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { socketManager } from "@/lib/phoenix-socket";
import { Account, Voucher, VoucherLine } from "@/types";
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  AlertCircle,
  Eye,
  ArrowRightLeft
} from "lucide-react";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // New Voucher modal state
  const [showModal, setShowModal] = useState(false);
  const [voucherType, setVoucherType] = useState<"FA" | "ÖD" | "GD" | "TH" | "DZ">("FA");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<{ account_id: number; debit: string; credit: string; description: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Selected voucher detail view modal
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vchs, accs] = await Promise.all([api.getVouchers(), api.getAccounts()]);
      setVouchers(vchs);
      setAccounts(accs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribePosted = socketManager.subscribe("voucher_posted", () => loadData());
    const unsubscribeCancelled = socketManager.subscribe("voucher_cancelled", () => loadData());

    return () => {
      unsubscribePosted();
      unsubscribeCancelled();
    };
  }, []);

  const openNewVoucherModal = () => {
    if (accounts.length >= 2) {
      setLines([
        { account_id: accounts[0].id, debit: "100", credit: "0", description: "Borç Kalemi" },
        { account_id: accounts[1].id, debit: "0", credit: "100", description: "Alacak Kalemi" },
      ]);
    }
    setShowModal(true);
  };

  const addLine = () => {
    if (accounts.length > 0) {
      setLines((prev) => [
        ...prev,
        { account_id: accounts[0].id, debit: "0", credit: "0", description: "" },
      ]);
    }
  };

  const updateLine = (idx: number, field: string, value: any) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Balance calculation
  const totalDebit = lines.reduce((acc, l) => acc + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    try {
      setSubmitting(true);
      const draft = await api.createVoucher({
        voucher_type: voucherType,
        description: description || `${voucherType} Fiş Kaydı`,
        date: date,
        lines: lines.map((l) => ({
          account_id: l.account_id,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          description: l.description,
        })),
      });

      // Post atomically to Elixir backend
      await api.postVoucher(draft.id);

      setShowModal(false);
      setDescription("");
      await loadData();
    } catch (err: any) {
      alert("Fiş oluşturma/nakil hatası: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostVoucher = async (id: number) => {
    try {
      await api.postVoucher(id);
      await loadData();
    } catch (err: any) {
      alert("Fiş nakil hatası: " + err.message);
    }
  };

  const handleCancelVoucher = async (id: number) => {
    if (!confirm("Bu fişi iptal etmek istediğinize emin misiniz? Muhasebe hareketleri ters kaydedilecektir.")) return;
    try {
      await api.cancelVoucher(id);
      await loadData();
    } catch (err: any) {
      alert("Fiş iptal hatası: " + err.message);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filterStatus === "all") return true;
    return v.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Fiş Motoru (Voucher Engine)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Otomatik Borç=Alacak Denge Kontrollü ve Ecto.Multi Atomik Nakil Motoru.
          </p>
        </div>

        <button
          onClick={openNewVoucherModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Fiş Gir</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2">
        {[
          { id: "all", label: "Tüm Fişler" },
          { id: "posted", label: "Nakledilmiş (Posted)" },
          { id: "draft", label: "Taslak (Draft)" },
          { id: "cancelled", label: "İptal Edilmiş" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vouchers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Fiş No</th>
                <th className="px-6 py-3.5">Tip</th>
                <th className="px-6 py-3.5">Tarih</th>
                <th className="px-6 py-3.5">Açıklama</th>
                <th className="px-6 py-3.5 text-right">Borç Toplamı</th>
                <th className="px-6 py-3.5 text-right">Alacak Toplamı</th>
                <th className="px-6 py-3.5">Durum</th>
                <th className="px-6 py-3.5 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-sans">
                    Fişler yükleniyor...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-sans">
                    Fiş kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-500/20 text-blue-300">
                        {v.voucher_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{v.date}</td>
                    <td className="px-6 py-4 font-sans text-slate-300">{v.description || "-"}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ₺{parseFloat(v.total_debit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-purple-400">
                      ₺{parseFloat(v.total_credit).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      {v.status === "posted" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Nakledildi</span>
                        </span>
                      ) : v.status === "draft" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Taslak</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold text-[10px] border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>İptal</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-sans space-x-2">
                      <button
                        onClick={() => setSelectedVoucher(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Detay Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {v.status === "draft" && (
                        <button
                          onClick={() => handlePostVoucher(v.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                        >
                          Naklet
                        </button>
                      )}

                      {v.status === "posted" && (
                        <button
                          onClick={() => handleCancelVoucher(v.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-[11px] font-semibold transition-colors"
                        >
                          İptal Et
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Voucher Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-3xl w-full rounded-2xl p-6 border border-blue-500/30 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Yeni Fiş Kaydı Oluştur & Deftere Naklet</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fiş Tipi</label>
                  <select
                    value={voucherType}
                    onChange={(e: any) => setVoucherType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  >
                    <option value="FA">FA - Satış Fişi</option>
                    <option value="ÖD">ÖD - Ödeme Fişi</option>
                    <option value="GD">GD - Gider Fişi</option>
                    <option value="TH">TH - Tahsilat Fişi</option>
                    <option value="DZ">DZ - Düzeltme Fişi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fiş Tarihi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Açıklama</label>
                  <input
                    type="text"
                    placeholder="Fiş genel açıklaması"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Dynamic Voucher Lines Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fiş Satırları</h4>
                  <button
                    type="button"
                    onClick={addLine}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Satır Ekle</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((l, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <select
                          value={l.account_id}
                          onChange={(e) => updateLine(idx, "account_id", Number(e.target.value))}
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name} ({a.normal_side})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Borç (TL)"
                          value={l.debit}
                          onChange={(e) => updateLine(idx, "debit", e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Alacak (TL)"
                          value={l.credit}
                          onChange={(e) => updateLine(idx, "credit", e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-purple-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Balance Indicator Badge */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isBalanced
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center space-x-2">
                  {isBalanced ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
                  <div>
                    <div className="font-bold">
                      {isBalanced ? "Borç ve Alacak Dengeli (Fiş Geçerli)" : "Fiş Borç ve Alacak Dengesiz!"}
                    </div>
                    <div className="text-[11px] opacity-80 font-mono">
                      Borç: ₺{totalDebit.toFixed(2)} | Alacak: ₺{totalCredit.toFixed(2)}
                    </div>
                  </div>
                </div>

                {!isBalanced && (
                  <div className="font-mono font-bold text-xs bg-rose-500/20 px-2.5 py-1 rounded-lg">
                    Fark: ₺{Math.abs(totalDebit - totalCredit).toFixed(2)}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced || submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-colors"
                >
                  {submitting ? "Fiş İşleniyor..." : "Fişi Oluştur ve Deftere Naklet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Voucher View Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-2xl w-full rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedVoucher.voucher_number}</h3>
                <p className="text-xs text-slate-400">{selectedVoucher.voucher_type} - {selectedVoucher.date}</p>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Açıklama:</span> {selectedVoucher.description || "Girilmedi"}
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-2 px-3">Hesap Kodu</th>
                    <th className="py-2 px-3 text-right">Borç</th>
                    <th className="py-2 px-3 text-right">Alacak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedVoucher.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 text-white">{l.account?.code} - {l.account?.name}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">₺{parseFloat(l.debit as string).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-purple-400">₺{parseFloat(l.credit as string).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
