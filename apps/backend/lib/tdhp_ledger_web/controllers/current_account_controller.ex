defmodule TdhpLedgerWeb.CurrentAccountController do
  use TdhpLedgerWeb, :controller
  alias TdhpLedger.CurrentAccounts

  def index(conn, _params) do
    current_accounts = CurrentAccounts.list_current_accounts()
    json(conn, %{data: current_accounts})
  end

  def create(conn, params) do
    case CurrentAccounts.create_current_account(params) do
      {:ok, current_account} ->
        conn
        |> put_status(:created)
        |> json(%{data: current_account})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(changeset)})
    end
  end

  defp format_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        to_string(Map.get(opts, String.to_existing_atom(key), key))
      end)
    end)
  end
end
