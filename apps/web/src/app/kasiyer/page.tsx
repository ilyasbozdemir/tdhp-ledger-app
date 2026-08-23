"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Account, CurrentAccount, Voucher } from "@/types";
import { 
  ShoppingCart, 
  CreditCard, 
  Wallet, 
  Building2, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Printer,
  Sparkles,
  Search
} from "lucide-react";

interface POSItem {
  id: string;
  name: string;
  price: number;
  kdvRate: number; // e.g. 20
  accountCode: string; // 600
}

const SAMPLE_PRODUCTS: POSItem[] = [
  { id: "p1", name: "Endüstriyel Yazılım Lisansı", price: 1500, kdvRate: 20, accountCode: "600" },
  { id: "p2", name: "Donanım Bakım Hizmeti", price: 750, kdvRate: 20, accountCode: "600" },
  { id: "p3", name: "POS Terminal Aksesuarı", price: 250, kdvRate: 20, accountCode: "600" },
  { id: "p4", name: "Teknik Danışmanlık Paket", price: 3000, kdvRate: 20, accountCode: "600" },
];

export default function CashierPOSPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [cart, setCart] = useState<{ item: POSItem; qty: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "credit">("cash"); // cash: 100, bank: 102, credit: 120
  const [description, setDescription] = useState("Kasiyer Hızlı Satış İşlemi");
  const [posting, setPosting] = useState(false);
  const [receiptVoucher, setReceiptVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getCurrentAccounts()]).then(([accs, curAccs]) => {
      setAccounts(accs);
      setCurrentAccounts(curAccs);
      if (curAccs.length > 0) {
        setSelectedCustomerId(curAccs[0].id);
      }
    });
  }, []);

  const addToCart = (product: POSItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.item.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.item.id === id) {
            const newQty = p.qty + delta;
            return newQty > 0 ? { ...p, qty: newQty } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: POSItem; qty: number }[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.item.id !== id));
  };

  // Financial calculations
  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
  const kdvAmount = subtotal * 0.20; // 20% KDV
  const grandTotal = subtotal + kdvAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setPosting(true);
      const acc100 = accounts.find((a) => a.code === "100");
      const acc102 = accounts.find((a) => a.code === "102");
      const acc120 = accounts.find((a) => a.code === "120");
      const acc600 = accounts.find((a) => a.code === "600");
      const acc391 = accounts.find((a) => a.code === "391");

      if (!acc600 || !acc391) {
        alert("Gerekli 600 veya 391 hesapları sistemde bulunamadı.");
        return;
      }

      // Determine Debit Payment Account (100 Kasa, 102 Banka, or 120 Alıcılar)
      let paymentAccId = acc100?.id;
      if (paymentMethod === "bank") paymentAccId = acc102?.id;
      if (paymentMethod === "credit") paymentAccId = acc120?.id;

      if (!paymentAccId) {
        alert("Ödeme hesabı belirlenemedi.");
        return;
      }

      const voucherPayload = {
        voucher_type: "FA",
        description: `${description} (${paymentMethod.toUpperCase()})`,
        date: new Date().toISOString().split("T")[0],
        lines: [
          // Debit Payment Account (Borç 100/102/120)
          {
            account_id: paymentAccId,
            current_account_id: paymentMethod === "credit" ? selectedCustomerId : null,
            debit: grandTotal,
            credit: 0,
            description: `Satış Tahsilatı - ${paymentMethod}`,
          },
          // Credit 600 Yurtiçi Satışlar (Alacak 600)
          {
            account_id: acc600.id,
            debit: 0,
            credit: subtotal,
            description: "Yurtiçi Satış Geliri",
          },
          // Credit 391 Hesaplanan KDV (Alacak 391)
          {
            account_id: acc391.id,
            debit: 0,
            credit: kdvAmount,
            description: "%20 Hesaplanan KDV",
          },
        ],
      };

      // 1. Create draft voucher
      const draft = await api.createVoucher(voucherPayload);

      // 2. Post voucher atomically to Elixir backend
      const posted = await api.postVoucher(draft.id);

      setReceiptVoucher(posted);
      setCart([]);
    } catch (err: any) {
      alert("Satış tamamlama hatası: " + err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <span>Kasiyer / POS Hızlı Satış Ekranı</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Otomatik Borç/Alacak dengeli Satış (FA) Fişi oluşturan hızlı ödeme terminali.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Catalog & Fast Buttons (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Hızlı Ürün / Hizmet Kataloğu</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="glass-card text-left p-4 rounded-xl border border-white/5 hover:border-emerald-500/40 hover:scale-[1.02] transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {prod.name}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      ₺{prod.price.toLocaleString("tr-TR")} <span className="text-[10px] text-slate-400 font-normal">+ %{prod.kdvRate} KDV</span>
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selection Card */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">Müşteri / Cari Seçimi</label>
            <div className="relative">
              <select
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {currentAccounts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.code} - {c.title} ({c.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Cart & Payment Checkout (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Satış Sepeti</span>
              <span className="text-xs text-slate-400 font-normal">{cart.reduce((a, c) => a + c.qty, 0)} Kalem</span>
            </h2>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Sepet boş. Lütfen soldan ürün ekleyin.</div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {cart.map(({ item, qty }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ₺{item.price.toFixed(2)} x {qty}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-white">{qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method & Total Summary */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Payment Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Ödeme Yöntemi</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "cash"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Wallet className="w-4 h-4 mb-1" />
                  <span>Nakit (100)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "bank"
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>Banka (102)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === "credit"
                      ? "bg-purple-500/20 border-purple-500 text-purple-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>Cari (120)</span>
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-900/80 rounded-xl p-3.5 space-y-1.5 border border-white/5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Ara Toplam:</span>
                <span className="font-mono">₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hesaplanan KDV (%20):</span>
                <span className="font-mono text-amber-400">₺{kdvAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>GENEL TOPLAM:</span>
                <span className="font-mono text-emerald-400 text-base">₺{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0 || posting}
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {posting ? (
                <span>Elixir Fiş Motoruna İşleniyor...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Satışı Tamamla ve Fiş Kes (FA)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal Popup */}
      {receiptVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-emerald-500/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Satış Fişi Nakledildi</h3>
              <p className="text-xs text-slate-400">Elixir Ecto.Multi işlemi başarıyla gerçekleştirildi.</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Fiş No:</span>
                <span className="font-bold text-white">{receiptVoucher.voucher_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fiş Tipi:</span>
                <span className="text-emerald-400">FA (Satış Fişi)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarih:</span>
                <span className="text-slate-200">{receiptVoucher.date}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                <span className="text-slate-300">Toplam Borç/Alacak:</span>
                <span className="text-emerald-400">₺{parseFloat(receiptVoucher.total_debit).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setReceiptVoucher(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Yazdır</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
