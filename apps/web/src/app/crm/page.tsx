"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CurrentAccount } from "@/types";
import { Handshake, Building, Users, Target, Plus, Phone, Mail, MapPin } from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";

export default function CrmPage() {
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentAccounts();
      setCurrentAccounts(data);
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
            <Handshake className="w-5 h-5 text-blue-500" />
            <span>CRM & Müşteri İlişkileri Katmanı (Customer Relationship Management)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cari Kartlar (120 Alıcılar / 320 Satıcılar), Satış Fırsatları ve Teklif Süreçleri.
          </p>
        </div>

        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all">
          <Plus className="w-4 h-4" />
          <span>Yeni Müşteri / Cari Ekle</span>
        </button>
      </div>

      {/* Process Timeline */}
      <ProcessTimeline />

      {/* Customer Portfolio Grid */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-500" />
            <span>Müşteri & Tedarikçi Cari Kartları</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Toplam: {currentAccounts.length} Kart</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Cari kartlar yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAccounts.map((ca) => (
              <div key={ca.id} className="glass-card rounded-xl p-4 border border-slate-200 dark:border-white/5 space-y-3 hover:border-blue-500/40">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {ca.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {ca.type === "customer" ? "Müşteri (120)" : ca.type === "supplier" ? "Tedarikçi (320)" : "Personel"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{ca.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vergi Dairesi / No: {ca.tax_office || "-"} / {ca.tax_number || "-"}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ca.phone || "Telefon belirtilmedi"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ca.address || "Adres belirtilmedi"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
