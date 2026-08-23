defmodule TdhpLedger.Reports.Mizan do
  @moduledoc """
  Financial Statements & Reports Engine:
  - Mizan (Trial Balance) with Opening, Period Debit/Credit, and Closing Debit/Credit.
  - KDV Mahsuplaştırma (Automated VAT settlement voucher calculation).
  - Income Statement (Gelir Tablosu).
  - Balance Sheet (Bilanço).
  """
  import Ecto.Query, warn: false
  alias TdhpLedger.Repo
  alias TdhpLedger.Accounts.Account
  alias TdhpLedger.Vouchers.VoucherLine
  alias TdhpLedger.Vouchers

  @doc """
  Generates live Trial Balance (Mizan) table.
  Calculates for each active account:
  - Account Code & Name
  - Period Debit (Dönem Borç)
  - Period Credit (Dönem Alacak)
  - Closing Debit Balance (Kapanış Borç Bakiye)
  - Closing Credit Balance (Kapanış Alacak Bakiye)
  """
  def generate_mizan do
    accounts = Repo.all(from a in Account, order_by: [asc: a.code])

    movements =
      from(vl in VoucherLine,
        join: v in assoc(vl, :voucher),
        where: v.status == "posted",
        group_by: vl.account_id,
        select: %{
          account_id: vl.account_id,
          total_debit: sum(vl.debit),
          total_credit: sum(vl.credit)
        }
      )
      |> Repo.all()
      |> Enum.into(%{}, fn m -> {m.account_id, m} end)

    rows =
      Enum.map(accounts, fn acc ->
        mov = Map.get(movements, acc.id, %{total_debit: Decimal.new("0.0"), total_credit: Decimal.new("0.0")})
        p_debit = mov.total_debit || Decimal.new("0.0")
        p_credit = mov.total_credit || Decimal.new("0.0")

        # Closing balances
        net_diff = Decimal.sub(p_debit, p_credit)

        {c_debit, c_credit} =
          if Decimal.gt?(net_diff, 0) do
            {net_diff, Decimal.new("0.0")}
          else
            {Decimal.new("0.0"), Decimal.abs(net_diff)}
          end

        %{
          id: acc.id,
          code: acc.code,
          name: acc.name,
          class_no: acc.class_no,
          normal_side: acc.normal_side,
          is_header: acc.is_header,
          period_debit: p_debit,
          period_credit: p_credit,
          closing_debit: c_debit,
          closing_credit: c_credit
        }
      end)

    totals =
      Enum.reduce(rows, %{p_debit: Decimal.new("0.0"), p_credit: Decimal.new("0.0"), c_debit: Decimal.new("0.0"), c_credit: Decimal.new("0.0")}, fn r, acc ->
        unless r.is_header do
          %{
            p_debit: Decimal.add(acc.p_debit, r.period_debit),
            p_credit: Decimal.add(acc.p_credit, r.period_credit),
            c_debit: Decimal.add(acc.c_debit, r.closing_debit),
            c_credit: Decimal.add(acc.c_credit, r.closing_credit)
          }
        else
          acc
        end
      end)

    %{
      rows: rows,
      totals: totals,
      is_balanced: Decimal.eq?(totals.p_debit, totals.p_credit)
    }
  end

  @doc """
  Calculates KDV Reconciliation (191 İndirilecek KDV vs 391 Hesaplanan KDV)
  and creates an automatic settlement voucher (KDV Mahsup Fişi).
  If 391 > 191: difference goes to 360 Ödenecek Vergi ve Fonlar (Credit).
  If 191 > 391: difference goes to 190 Devreden KDV (Debit).
  """
  def generate_kdv_mahsup do
    acc_191 = Repo.get_by(Account, code: "191")
    acc_391 = Repo.get_by(Account, code: "391")
    acc_360 = Repo.get_by(Account, code: "360")

    if is_nil(acc_191) or is_nil(acc_391) or is_nil(acc_360) do
      {:error, "KDV Mahsubu için gerekli 191, 391 ve 360 hesapları bulunamadı."}
    else
      val_191 = get_account_posted_balance(acc_191.id, "D")
      val_391 = get_account_posted_balance(acc_391.id, "C")

      if Decimal.eq?(val_191, 0) and Decimal.eq?(val_391, 0) do
        {:error, "KDV hesaplarında (191 ve 391) mahsuplaştırılacak bakiye yok."}
      else
        lines = [
          # Close 391 (Debit 391)
          %{account_id: acc_391.id, debit: val_391, credit: Decimal.new("0.0"), description: "391 Hesaplanan KDV Kapatılması"},
          # Close 191 (Credit 191)
          %{account_id: acc_191.id, debit: Decimal.new("0.0"), credit: val_191, description: "191 İndirilecek KDV Kapatılması"}
        ]

        # Balance difference
        diff = Decimal.sub(val_391, val_191)

        lines =
          if Decimal.gt?(diff, 0) do
            # 391 > 191 -> Payable VAT to 360 (Credit 360)
            lines ++ [%{account_id: acc_360.id, debit: Decimal.new("0.0"), credit: diff, description: "Ödenecek KDV (360)"}]
          else
            # 191 > 391 -> Carried forward VAT to 190
            acc_190 = get_or_create_190_account()
            lines ++ [%{account_id: acc_190.id, debit: Decimal.abs(diff), credit: Decimal.new("0.0"), description: "Devreden KDV (190)"}]
          end

        voucher_attrs = %{
          "voucher_type" => "DZ",
          "description" => "Aylık Otomatik KDV Mahsup Fişi (191 vs 391)",
          "date" => Date.to_iso8601(Date.utc_today()),
          "lines" => lines
        }

        with {:ok, draft_voucher} <- Vouchers.create_voucher(voucher_attrs),
             {:ok, posted_voucher} <- Vouchers.post_voucher(draft_voucher.id) do
          {:ok, %{
            voucher: posted_voucher,
            val_191: val_191,
            val_391: val_391,
            net_tax: diff
          }}
        end
      end
    end
  end

  @doc """
  Income Statement (Gelir Tablosu - Class 6 accounts).
  """
  def income_statement do
    mizan = generate_mizan()
    class_6_rows = Enum.filter(mizan.rows, fn r -> r.class_no == 6 and not r.is_header end)

    gross_sales = fetch_row_credit(class_6_rows, "600")
    sales_returns = fetch_row_debit(class_6_rows, "610")
    sales_discounts = fetch_row_debit(class_6_rows, "611")

    net_sales = gross_sales |> Decimal.sub(sales_returns) |> Decimal.sub(sales_discounts)

    %{
      gross_sales: gross_sales,
      sales_returns: sales_returns,
      sales_discounts: sales_discounts,
      net_sales: net_sales,
      rows: class_6_rows
    }
  end

  @doc """
  Balance Sheet (Bilanço - Assets Class 1 & 2 vs Liabilities & Equity Class 3, 4, 5).
  """
  def balance_sheet do
    mizan = generate_mizan()
    rows = Enum.reject(mizan.rows, fn r -> r.is_header end)

    assets = Enum.filter(rows, fn r -> r.class_no in [1, 2] end)
    liabilities = Enum.filter(rows, fn r -> r.class_no in [3, 4, 5] end)

    total_assets = Enum.reduce(assets, Decimal.new("0.0"), fn r, acc -> Decimal.add(acc, r.closing_debit) end)
    total_liabilities = Enum.reduce(liabilities, Decimal.new("0.0"), fn r, acc -> Decimal.add(acc, r.closing_credit) end)

    %{
      total_assets: total_assets,
      total_liabilities: total_liabilities,
      asset_rows: assets,
      liability_rows: liabilities,
      is_balanced: Decimal.eq?(total_assets, total_liabilities)
    }
  end

  # Helpers
  defp get_account_posted_balance(account_id, side) do
    mov =
      from(vl in VoucherLine,
        join: v in assoc(vl, :voucher),
        where: vl.account_id == ^account_id and v.status == "posted",
        select: %{debit: sum(vl.debit), credit: sum(vl.credit)}
      )
      |> Repo.one()

    d = (mov && mov.debit) || Decimal.new("0.0")
    c = (mov && mov.credit) || Decimal.new("0.0")

    if side == "D", do: Decimal.sub(d, c), else: Decimal.sub(c, d)
  end

  defp get_or_create_190_account do
    case Repo.get_by(Account, code: "190") do
      nil ->
        {:ok, acc} = Account.changeset(%Account{}, %{
          code: "190",
          name: "Devreden KDV",
          class_no: 1,
          parent_code: "1",
          normal_side: "D"
        }) |> Repo.insert()
        acc

      acc -> acc
    end
  end

  defp fetch_row_credit(rows, code) do
    case Enum.find(rows, fn r -> r.code == code end) do
      nil -> Decimal.new("0.0")
      r -> r.closing_credit
    end
  end

  defp fetch_row_debit(rows, code) do
    case Enum.find(rows, fn r -> r.code == code end) do
      nil -> Decimal.new("0.0")
      r -> r.closing_debit
    end
  end
end
