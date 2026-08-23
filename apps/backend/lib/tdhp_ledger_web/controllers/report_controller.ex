defmodule TdhpLedgerWeb.ReportController do
  use TdhpLedgerWeb, :controller
  alias TdhpLedger.Reports.Mizan
  alias TdhpLedger.Audit

  def mizan(conn, _params) do
    data = Mizan.generate_mizan()
    json(conn, %{data: data})
  end

  def kdv_mahsup(conn, _params) do
    case Mizan.generate_kdv_mahsup() do
      {:ok, result} ->
        json(conn, %{message: "KDV Mahsup Fişi başarıyla oluşturuldu ve nakledildi.", data: result})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  def income_statement(conn, _params) do
    data = Mizan.income_statement()
    json(conn, %{data: data})
  end

  def balance_sheet(conn, _params) do
    data = Mizan.balance_sheet()
    json(conn, %{data: data})
  end

  def audit_logs(conn, _params) do
    logs = Audit.list_logs()
    json(conn, %{data: logs})
  end
end
