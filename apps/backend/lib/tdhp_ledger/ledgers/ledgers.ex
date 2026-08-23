defmodule TdhpLedger.Ledgers do
  @moduledoc """
  Ledger Query Engine (Defterler):
  - Defter-i Kebir (General Ledger)
  - Muavin Defter (Subsidiary Ledger per Current Account)
  - Kasa Defteri (Cash Ledger for 100)
  - Banka Defteri (Bank Ledger for 102)
  """
  import Ecto.Query, warn: false
  alias TdhpLedger.Repo
  alias TdhpLedger.Vouchers.VoucherLine
  alias TdhpLedger.Accounts.Account

  @doc """
  Returns all posted movements for a given Account ID (General Ledger / Defter-i Kebir).
  """
  def general_ledger(account_id) do
    account = Repo.get!(Account, account_id)

    lines =
      VoucherLine
      |> join(:inner, [vl], v in assoc(vl, :voucher))
      |> where([vl, v], vl.account_id == ^account_id and v.status == "posted")
      |> order_by([vl, v], asc: v.date, asc: vl.id)
      |> select([vl, v], %{
        line_id: vl.id,
        voucher_id: v.id,
        voucher_number: v.voucher_number,
        voucher_type: v.voucher_type,
        date: v.date,
        description: fragment("COALESCE(?, ?)", vl.description, v.description),
        debit: vl.debit,
        credit: vl.credit
      })
      |> Repo.all()

    # Compute running balance
    {entries, _running} =
      Enum.map_reduce(lines, Decimal.new("0.0"), fn entry, acc_bal ->
        net =
          if account.normal_side == "D" do
            Decimal.sub(entry.debit, entry.credit)
          else
            Decimal.sub(entry.credit, entry.debit)
          end

        new_bal = Decimal.add(acc_bal, net)
        {Map.put(entry, :running_balance, new_bal), new_bal}
      end)

    %{
      account: account,
      entries: entries,
      current_balance: account.balance
    }
  end

  @doc """
  Returns subsidiary ledger (Muavin) for a specific current account (Müşteri/Tedarikçi/Personel).
  """
  def subsidiary_ledger(current_account_id) do
    lines =
      VoucherLine
      |> join(:inner, [vl], v in assoc(vl, :voucher))
      |> join(:inner, [vl, v], a in assoc(vl, :account))
      |> where([vl, v, a], vl.current_account_id == ^current_account_id and v.status == "posted")
      |> order_by([vl, v, a], asc: v.date, asc: vl.id)
      |> select([vl, v, a], %{
        line_id: vl.id,
        voucher_number: v.voucher_number,
        date: v.date,
        account_code: a.code,
        account_name: a.name,
        description: fragment("COALESCE(?, ?)", vl.description, v.description),
        debit: vl.debit,
        credit: vl.credit
      })
      |> Repo.all()

    {entries, _running} =
      Enum.map_reduce(lines, Decimal.new("0.0"), fn entry, acc_bal ->
        net = Decimal.sub(entry.debit, entry.credit)
        new_bal = Decimal.add(acc_bal, net)
        {Map.put(entry, :running_balance, new_bal), new_bal}
      end)

    entries
  end

  @doc """
  Cash Ledger view (Kasa Defteri - 100).
  """
  def cash_ledger do
    case Repo.get_by(Account, code: "100") do
      nil -> %{account: nil, entries: []}
      acc -> general_ledger(acc.id)
    end
  end

  @doc """
  Bank Ledger view (Banka Defteri - 102).
  """
  def bank_ledger do
    case Repo.get_by(Account, code: "102") do
      nil -> %{account: nil, entries: []}
      acc -> general_ledger(acc.id)
    end
  end
end
