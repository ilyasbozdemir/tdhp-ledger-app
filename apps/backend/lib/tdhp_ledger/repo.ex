defmodule TdhpLedger.Repo do
  use Ecto.Repo,
    otp_app: :tdhp_ledger,
    adapter: Ecto.Adapters.Postgres
end
