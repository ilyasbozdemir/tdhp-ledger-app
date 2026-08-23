defmodule TdhpLedgerWeb.Router do
  use TdhpLedgerWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", TdhpLedgerWeb do
    pipe_through :api

    # Accounts (TDHP 9-Class Plan)
    get "/accounts", AccountController, :index
    post "/accounts", AccountController, :create

    # Current Accounts (Cari)
    get "/current-accounts", CurrentAccountController, :index
    post "/current-accounts", CurrentAccountController, :create

    # Voucher Engine (Fiş Motoru)
    get "/vouchers", VoucherController, :index
    get "/vouchers/:id", VoucherController, :show
    post "/vouchers", VoucherController, :create
    post "/vouchers/:id/post", VoucherController, :post
    post "/vouchers/:id/cancel", VoucherController, :cancel

    # Ledgers (Defterler)
    get "/ledgers/kebir/:account_id", LedgerController, :kebir
    get "/ledgers/muavin/:current_account_id", LedgerController, :muavin
    get "/ledgers/kasa", LedgerController, :kasa
    get "/ledgers/banka", LedgerController, :banka

    # Reports (Mizan, KDV Mahsup, Gelir Tablosu, Bilanço)
    get "/reports/mizan", ReportController, :mizan
    post "/reports/kdv-mahsup", ReportController, :kdv_mahsup
    get "/reports/income-statement", ReportController, :income_statement
    get "/reports/balance-sheet", ReportController, :balance_sheet
    get "/reports/audit-logs", ReportController, :audit_logs
  end

  if Application.compile_env(:tdhp_ledger, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: TdhpLedgerWeb.Telemetry
    end
  end
end
