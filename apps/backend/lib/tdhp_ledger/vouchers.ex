defmodule TdhpLedger.Vouchers do
  @moduledoc """
  The Voucher Engine (Fiş Motoru) context.
  Handles voucher creation, strict debit/credit balance validation,
  atomic posting (`Ecto.Multi`), ledger updating, audit logging, and WebSocket broadcasts.
  """
  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias TdhpLedger.Repo
  alias TdhpLedger.Vouchers.{Voucher, VoucherLine}
  alias TdhpLedger.Accounts.Account
  alias TdhpLedger.Audit

  def list_vouchers do
    Voucher
    |> preload(lines: [:account, :current_account])
    |> order_by([v], desc: v.inserted_at)
    |> Repo.all()
  end

  def get_voucher!(id) do
    Voucher
    |> preload(lines: [:account, :current_account])
    |> Repo.get!(id)
  end

  def create_voucher(attrs) do
    attrs = prepare_voucher_attrs(attrs)

    case validate_debit_credit_balance(attrs) do
      :ok ->
        %Voucher{}
        |> Voucher.changeset(attrs)
        |> Repo.insert()

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Atomically posts a voucher to the ledgers using Ecto.Multi.
  - Verifies status is 'draft'
  - Verifies sum(debit) == sum(credit)
  - Updates target account balances based on TDHP rules
  - Changes voucher status to 'posted'
  - Writes audit log
  - Broadcasts WebSocket event
  """
  def post_voucher(voucher_id) do
    voucher = get_voucher!(voucher_id)

    cond do
      voucher.status != "draft" ->
        {:error, "Sadece 'draft' durumundaki fişler nakledilebilir."}

      not Decimal.eq?(voucher.total_debit, voucher.total_credit) ->
        {:error, "Fiş Borç ve Alacak toplamı eşit değildir! (Borç: #{voucher.total_debit}, Alacak: #{voucher.total_credit})"}

      Enum.empty?(voucher.lines) ->
        {:error, "Fiş satırı boş olamaz."}

      true ->
        multi =
          Multi.new()
          |> Multi.update(:update_voucher_status, Voucher.changeset(voucher, %{status: "posted"}))
          |> update_account_balances_multi(voucher.lines)
          |> Multi.run(:audit, fn _repo, _changes ->
            Audit.log("Voucher", voucher.id, "POST", %{
              voucher_number: voucher.voucher_number,
              total_debit: voucher.total_debit,
              total_credit: voucher.total_credit
            })
          end)

        case Repo.transaction(multi) do
          {:ok, %{update_voucher_status: updated_voucher}} ->
            # Broadcast WebSocket notification for live UI updates
            broadcast_voucher_event("voucher_posted", updated_voucher)
            {:ok, updated_voucher}

          {:error, _failed_operation, reason, _changes_so_far} ->
            {:error, reason}
        end
    end
  end

  def cancel_voucher(voucher_id) do
    voucher = get_voucher!(voucher_id)

    if voucher.status != "posted" do
      {:error, "Sadece nakledilmiş (posted) fişler iptal edilebilir."}
    else
      multi =
        Multi.new()
        |> Multi.update(:update_voucher_status, Voucher.changeset(voucher, %{status: "cancelled"}))
        |> reverse_account_balances_multi(voucher.lines)
        |> Multi.run(:audit, fn _repo, _changes ->
          Audit.log("Voucher", voucher.id, "CANCEL", %{
            voucher_number: voucher.voucher_number
          })
        end)

      case Repo.transaction(multi) do
        {:ok, %{update_voucher_status: cancelled_voucher}} ->
          broadcast_voucher_event("voucher_cancelled", cancelled_voucher)
          {:ok, cancelled_voucher}

        {:error, _op, reason, _changes} ->
          {:error, reason}
      end
    end
  end

  # Helpers
  defp prepare_voucher_attrs(attrs) do
    lines = attrs["lines"] || attrs[:lines] || []

    {tot_debit, tot_credit} =
      Enum.reduce(lines, {Decimal.new("0.0"), Decimal.new("0.0")}, fn line, {d_acc, c_acc} ->
        debit = parse_decimal(line["debit"] || line[:debit])
        credit = parse_decimal(line["credit"] || line[:credit])
        {Decimal.add(d_acc, debit), Decimal.add(c_acc, credit)}
      end)

    voucher_num = attrs["voucher_number"] || attrs[:voucher_number] || generate_voucher_number(attrs["voucher_type"] || attrs[:voucher_type] || "FA")

    attrs
    |> Map.put("voucher_number", voucher_num)
    |> Map.put("total_debit", tot_debit)
    |> Map.put("total_credit", tot_credit)
  end

  defp validate_debit_credit_balance(attrs) do
    total_debit = attrs["total_debit"] || attrs[:total_debit]
    total_credit = attrs["total_credit"] || attrs[:total_credit]

    if Decimal.eq?(total_debit, total_credit) and Decimal.gt?(total_debit, 0) do
      :ok
    else
      {:error, "Fiş Borç ve Alacak dengesiz veya sıfır! (Borç: #{total_debit}, Alacak: #{total_credit})"}
    end
  end

  defp update_account_balances_multi(multi, lines) do
    Enum.reduce(lines, multi, fn line, acc_multi ->
      Multi.run(acc_multi, :"update_account_#{line.id}", fn repo, _changes ->
        account = repo.get!(Account, line.account_id)

        # Apply TDHP normal balance adjustment
        # Normal side D: balance = balance + debit - credit
        # Normal side C: balance = balance + credit - debit
        net_change =
          if account.normal_side == "D" do
            Decimal.sub(line.debit, line.credit)
          else
            Decimal.sub(line.credit, line.debit)
          end

        new_balance = Decimal.add(account.balance, net_change)

        account
        |> Account.changeset(%{balance: new_balance})
        |> repo.update()
      end)
    end)
  end

  defp reverse_account_balances_multi(multi, lines) do
    Enum.reduce(lines, multi, fn line, acc_multi ->
      Multi.run(acc_multi, :"revert_account_#{line.id}", fn repo, _changes ->
        account = repo.get!(Account, line.account_id)

        net_change =
          if account.normal_side == "D" do
            Decimal.sub(line.debit, line.credit)
          else
            Decimal.sub(line.credit, line.debit)
          end

        new_balance = Decimal.sub(account.balance, net_change)

        account
        |> Account.changeset(%{balance: new_balance})
        |> repo.update()
      end)
    end)
  end

  defp generate_voucher_number(type) do
    type_code = String.upcase(to_string(type))
    timestamp = DateTime.utc_now() |> Calendar.strftime("%Y%m%d%H%M%S")
    rand = :rand.uniform(999) |> Integer.to_string() |> String.pad_leading(3, "0")
    "FIS-#{type_code}-#{timestamp}-#{rand}"
  end

  defp parse_decimal(nil), do: Decimal.new("0.0")
  defp parse_decimal(%Decimal{} = d), do: d
  defp parse_decimal(val) when is_binary(val) do
    case Decimal.parse(val) do
      {d, _} -> d
      :error -> Decimal.new("0.0")
    end
  end
  defp parse_decimal(val) when is_number(val), do: Decimal.new(to_string(val))

  defp broadcast_voucher_event(event, voucher) do
    TdhpLedgerWeb.Endpoint.broadcast("ledger:lobby", event, %{
      voucher_id: voucher.id,
      voucher_number: voucher.voucher_number,
      status: voucher.status,
      total_debit: voucher.total_debit,
      total_credit: voucher.total_credit
    })
  rescue
    _ -> :ok
  end
end
