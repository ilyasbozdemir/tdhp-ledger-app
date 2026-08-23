defmodule TdhpLedgerWeb.LedgerController do
  use TdhpLedgerWeb, :controller
  alias TdhpLedger.Ledgers

  def kebir(conn, %{"account_id" => account_id}) do
    res = Ledgers.general_ledger(account_id)
    json(conn, %{data: res})
  end

  def muavin(conn, %{"current_account_id" => current_account_id}) do
    res = Ledgers.subsidiary_ledger(current_account_id)
    json(conn, %{data: res})
  end

  def kasa(conn, _params) do
    res = Ledgers.cash_ledger()
    json(conn, %{data: res})
  end

  def banka(conn, _params) do
    res = Ledgers.bank_ledger()
    json(conn, %{data: res})
  end
end
