"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account } from "@/types";
import { 
  FolderTree, 
  Plus, 
  Search, 
  CheckCircle2, 
  Folder, 
  FileCode,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AccountPlanPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New account form state
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    try {
      setSubmitting(true);
      await api.createAccount({
        code: newCode,
        name: newName,
      });
      setNewCode("");
      setNewName("");
      setShowModal(false);
      await loadAccounts();
    } catch (err: any) {
      alert("Hesap ekleme hatası: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.code.toLowerCase().includes(search.toLowerCase()) ||
      acc.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === null || acc.class_no === selectedClass;
    return matchesSearch && matchesClass;
  });

  const mainClasses = [
    { no: 1, name: "1 - DÖNEN VARLIKLAR", side: "D" },
    { no: 2, name: "2 - DURAN VARLIKLAR", side: "D" },
    { no: 3, name: "3 - KISA VADELİ YABANCI KAYNAKLAR", side: "C" },
    { no: 4, name: "4 - UZUN VADELİ YABANCI KAYNAKLAR", side: "C" },
    { no: 5, name: "5 - ÖZKAYNAKLAR", side: "C" },
    { no: 6, name: "6 - GELİR TABLOSU HESAPLARI", side: "C" },
    { no: 7, name: "7 - MALİYET HESAPLARI", side: "D" },
    { no: 8, name: "8 - SERBEST HESAPLAR", side: "D" },
    { no: 9, name: "9 - NAZIM HESAPLAR", side: "D" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-blue-400" />
            <span>Tek Düzen Hesap Planı (TDHP) Mimarisi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            9 Ana Hesap Sınıfı, Borç (D) / Alacak (C) Bakiye Tarafı Kuralları ve Dinamik Alt Hesap Planı.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Alt Hesap Ekle</span>
        </button>
      </div>

      {/* 9 Class Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedClass(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedClass === null
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          Tüm Sınıflar (1-9)
        </button>
        {mainClasses.map((c) => (
          <button
            key={c.no}
            onClick={() => setSelectedClass(c.no)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedClass === c.no
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Sınıf {c.no}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Hesap kodu (ör: 100, 102, 320) veya hesap adı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Accounts List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Hesap Kodu</th>
                <th className="px-6 py-3.5">Hesap Adı</th>
                <th className="px-6 py-3.5">Sınıf</th>
                <th className="px-6 py-3.5">Normal Bakiye Yönü</th>
                <th className="px-6 py-3.5 text-right">Güncel Bakiye</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Hesap planı yükleniyor...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Arama kriterinize uygun hesap bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      acc.is_header ? "bg-slate-900/50 font-bold text-blue-300" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-bold flex items-center space-x-2 text-white">
                      {acc.is_header ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileCode className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{acc.code}</span>
                    </td>
                    <td className="px-6 py-4 font-sans font-medium text-slate-200">{acc.name}</td>
                    <td className="px-6 py-4 font-sans text-slate-400">Sınıf {acc.class_no}</td>
                    <td className="px-6 py-4">
                      {acc.normal_side === "D" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          Borç (D - Debit)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold text-[10px]">
                          Alacak (C - Credit)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      ₺{parseFloat(acc.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sub-Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-blue-500/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Yeni TDHP Hesap Ekle</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hesap Kodu</label>
                <input
                  type="text"
                  placeholder="ör: 100.01 veya 120.02"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  İlk rakama göre sınıf (1-9) ve Borç/Alacak yönü otomatik belirlenir.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hesap Adı</label>
                <input
                  type="text"
                  placeholder="ör: Merkez Kasa USD veya ABC Ltd. Alıcı"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
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
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-colors"
                >
                  {submitting ? "Kaydediliyor..." : "Hesabı Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
