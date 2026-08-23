export interface Account {
  id: number;
  code: string;
  name: string;
  class_no: number;
  parent_code: string | null;
  normal_side: "D" | "C";
  balance: string;
  is_active: boolean;
  is_header: boolean;
}

export interface CurrentAccount {
  id: number;
  code: string;
  title: string;
  type: "customer" | "supplier" | "employee" | "cashier";
  tax_number?: string;
  tax_office?: string;
  phone?: string;
  address?: string;
  account_id?: number;
  account?: Account;
}

export interface VoucherLine {
  id?: number;
  account_id: number;
  current_account_id?: number | null;
  debit: string | number;
  credit: string | number;
  description?: string;
  account?: Account;
  current_account?: CurrentAccount;
}

export interface Voucher {
  id: number;
  voucher_number: string;
  voucher_type: "FA" | "ÖD" | "GD" | "TH" | "DZ";
  date: string;
  description: string;
  status: "draft" | "posted" | "cancelled";
  total_debit: string;
  total_credit: string;
  lines: VoucherLine[];
  inserted_at?: string;
}

export interface MizanRow {
  id: number;
  code: string;
  name: string;
  class_no: number;
  normal_side: "D" | "C";
  is_header: boolean;
  period_debit: string;
  period_credit: string;
  closing_debit: string;
  closing_credit: string;
}

export interface MizanReport {
  rows: MizanRow[];
  totals: {
    p_debit: string;
    p_credit: string;
    c_debit: string;
    c_credit: string;
  };
  is_balanced: boolean;
}

export interface LedgerEntry {
  line_id: number;
  voucher_id?: number;
  voucher_number: string;
  voucher_type?: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  running_balance: string;
  account_code?: string;
  account_name?: string;
}

export interface KebirLedger {
  account: Account;
  entries: LedgerEntry[];
  current_balance: string;
}

export interface IncomeStatement {
  gross_sales: string;
  sales_returns: string;
  sales_discounts: string;
  net_sales: string;
  rows: MizanRow[];
}

export interface BalanceSheet {
  total_assets: string;
  total_liabilities: string;
  asset_rows: MizanRow[];
  liability_rows: MizanRow[];
  is_balanced: boolean;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  payload: any;
  actor: string;
  inserted_at: string;
}
