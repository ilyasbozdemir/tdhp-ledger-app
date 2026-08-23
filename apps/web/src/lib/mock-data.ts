import { Account, CurrentAccount, Voucher, AuditLog } from "@/types";

export const MOCK_USER = {
  name: "İlyas Bozdemir",
  email: "ilyas@tdhpledger.com",
  role: "Baş Muhasebeci & Admin",
  company: "TDHP Ledger A.Ş.",
  avatar: "İB",
  status: "Online",
};

export const MOCK_ACCOUNTS: Account[] = [
  { id: 1, code: "100", name: "KASA HESABI", class_no: 1, parent_code: null, normal_side: "D", balance: "14250.00", is_active: true, is_header: false },
  { id: 2, code: "102", name: "BANKALAR HESABI", class_no: 1, parent_code: null, normal_side: "D", balance: "85600.00", is_active: true, is_header: false },
  { id: 3, code: "120", name: "ALICILAR HESABI", class_no: 1, parent_code: null, normal_side: "D", balance: "45000.00", is_active: true, is_header: false },
  { id: 4, code: "153", name: "TİCARİ MALLAR HESABI", class_no: 1, parent_code: null, normal_side: "D", balance: "128400.00", is_active: true, is_header: false },
  { id: 5, code: "191", name: "İNDİRİLECEK KDV HESABI", class_no: 1, parent_code: null, normal_side: "D", balance: "3240.00", is_active: true, is_header: false },
  { id: 6, code: "320", name: "SATICILAR HESABI", class_no: 3, parent_code: null, normal_side: "C", balance: "32000.00", is_active: true, is_header: false },
  { id: 7, code: "335", name: "PERSONELE BORÇLAR HESABI", class_no: 3, parent_code: null, normal_side: "C", balance: "98500.00", is_active: true, is_header: false },
  { id: 8, code: "391", name: "HESAPLANAN KDV HESABI", class_no: 3, parent_code: null, normal_side: "C", balance: "6480.00", is_active: true, is_header: false },
  { id: 9, code: "600", name: "YURTİÇİ SATIŞLAR HESABI", class_no: 6, parent_code: null, normal_side: "C", balance: "145000.00", is_active: true, is_header: false },
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 101,
    voucher_number: "FİŞ-2026-001",
    voucher_type: "FA",
    date: "2026-08-23",
    description: "Kasiyer POS Satış Fişi - Peşin Tahsilat",
    status: "posted",
    total_debit: "2500.00",
    total_credit: "2500.00",
    lines: [],
  },
  {
    id: 102,
    voucher_number: "FİŞ-2026-002",
    voucher_type: "TH",
    date: "2026-08-23",
    description: "120.01 ABC A.Ş. Banka Havale Tahsilatı",
    status: "posted",
    total_debit: "12500.00",
    total_credit: "12500.00",
    lines: [],
  },
  {
    id: 103,
    voucher_number: "FİŞ-2026-003",
    voucher_type: "ÖD",
    date: "2026-08-22",
    description: "320.01 Tedarikçi Mal Alım Ödemesi",
    status: "posted",
    total_debit: "8600.00",
    total_credit: "8600.00",
    lines: [],
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 1, entity_type: "Voucher", entity_id: "101", action: "POSTED", payload: {}, actor: "ilyas.bozdemir", inserted_at: "2026-08-23T14:30:00Z" },
  { id: 2, entity_type: "Account", entity_id: "153", action: "UPDATED", payload: {}, actor: "system", inserted_at: "2026-08-23T14:15:00Z" },
  { id: 3, entity_type: "CurrentAccount", entity_id: "120.01", action: "CREATED", payload: {}, actor: "ilyas.bozdemir", inserted_at: "2026-08-23T13:45:00Z" },
];
