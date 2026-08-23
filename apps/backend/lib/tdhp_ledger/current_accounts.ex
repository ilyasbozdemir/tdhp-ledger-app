defmodule TdhpLedger.CurrentAccounts do
  @moduledoc """
  The CurrentAccounts context for managing Cari Hesaplar (Customers, Suppliers, Employees, Cashiers).
  """
  import Ecto.Query, warn: false
  alias TdhpLedger.Repo
  alias TdhpLedger.CurrentAccounts.CurrentAccount

  def list_current_accounts do
    CurrentAccount
    |> preload(:account)
    |> order_by([c], asc: c.code)
    |> Repo.all()
  end

  def get_current_account!(id) do
    CurrentAccount
    |> preload(:account)
    |> Repo.get!(id)
  end

  def create_current_account(attrs \\ %{}) do
    %CurrentAccount{}
    |> CurrentAccount.changeset(attrs)
    |> Repo.insert()
  end

  def update_current_account(%CurrentAccount{} = current_account, attrs) do
    current_account
    |> CurrentAccount.changeset(attrs)
    |> Repo.update()
  end

  def delete_current_account(%CurrentAccount{} = current_account) do
    Repo.delete(current_account)
  end
end
