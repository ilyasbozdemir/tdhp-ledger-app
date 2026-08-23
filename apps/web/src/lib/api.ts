import { Account, CurrentAccount, Voucher, MizanReport, KebirLedger, LedgerEntry, IncomeStatement, BalanceSheet, AuditLog } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || "Bir API hatası oluştu.");
  }
  return json.data;
}

export const api = {
  // Accounts (TDHP)
  getAccounts: () => fetchJson<Account[]>("/accounts"),
  createAccount: (data: Partial<Account>) =>
    fetchJson<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),

  // Current Accounts (Cari)
  getCurrentAccounts: () => fetchJson<CurrentAccount[]>("/current-accounts"),
  createCurrentAccount: (data: Partial<CurrentAccount>) =>
    fetchJson<CurrentAccount>("/current-accounts", { method: "POST", body: JSON.stringify(data) }),

  // Voucher Engine (Fiş Motoru)
  getVouchers: () => fetchJson<Voucher[]>("/vouchers"),
  getVoucher: (id: number) => fetchJson<Voucher>(`/vouchers/${id}`),
  createVoucher: (data: any) =>
    fetchJson<Voucher>("/vouchers", { method: "POST", body: JSON.stringify(data) }),
  postVoucher: (id: number) =>
    fetchJson<Voucher>(`/vouchers/${id}/post`, { method: "POST" }),
  cancelVoucher: (id: number) =>
    fetchJson<Voucher>(`/vouchers/${id}/cancel`, { method: "POST" }),

  // Ledgers (Defterler)
  getKebir: (accountId: number) => fetchJson<KebirLedger>(`/ledgers/kebir/${accountId}`),
  getMuavin: (currentAccountId: number) => fetchJson<LedgerEntry[]>(`/ledgers/muavin/${currentAccountId}`),
  getKasaLedger: () => fetchJson<KebirLedger>("/ledgers/kasa"),
  getBankaLedger: () => fetchJson<KebirLedger>("/ledgers/banka"),

  // Reports
  getMizan: () => fetchJson<MizanReport>("/reports/mizan"),
  runKdvMahsup: () => fetchJson<{ voucher: Voucher; val_191: string; val_391: string; net_tax: string }>("/reports/kdv-mahsup", { method: "POST" }),
  getIncomeStatement: () => fetchJson<IncomeStatement>("/reports/income-statement"),
  getBalanceSheet: () => fetchJson<BalanceSheet>("/reports/balance-sheet"),
  getAuditLogs: () => fetchJson<AuditLog[]>("/reports/audit-logs"),
};
