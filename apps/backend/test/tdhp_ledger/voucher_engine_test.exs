defmodule TdhpLedger.VoucherEngineTest do
  use TdhpLedger.DataCase, async: true
  alias TdhpLedger.Accounts
  alias TdhpLedger.Vouchers
  alias TdhpLedger.Reports.Mizan

  setup do
    {:ok, acc_100} = Accounts.create_account(%{"code" => "100", "name" => "Kasa", "class_no" => 1, "normal_side" => "D"})
    {:ok, acc_600} = Accounts.create_account(%{"code" => "600", "name" => "Yurtiçi Satışlar", "class_no" => 6, "normal_side" => "C"})
    {:ok, acc_391} = Accounts.create_account(%{"code" => "391", "name" => "Hesaplanan KDV", "class_no" => 3, "normal_side" => "C"})
    {:ok, acc_191} = Accounts.create_account(%{"code" => "191", "name" => "İndirilecek KDV", "class_no" => 1, "normal_side" => "D"})
    {:ok, acc_360} = Accounts.create_account(%{"code" => "360", "name" => "Ödenecek Vergi ve Fonlar", "class_no" => 3, "normal_side" => "C"})

    %{
      acc_100: acc_100,
      acc_600: acc_600,
      acc_391: acc_391,
      acc_191: acc_191,
      acc_360: acc_360
    }
  end

  test "rejects voucher creation when debit and credit are unbalanced", %{acc_100: acc_100, acc_600: acc_600} do
    attrs = %{
      "voucher_type" => "FA",
      "description" => "Dengesiz Fiş Testi",
      "date" => Date.to_iso8601(Date.utc_today()),
      "lines" => [
        %{"account_id" => acc_100.id, "debit" => 100.0, "credit" => 0.0},
        %{"account_id" => acc_600.id, "debit" => 0.0, "credit" => 80.0} # Dengesiz 100 != 80
      ]
    }

    assert {:error, reason} = Vouchers.create_voucher(attrs)
    assert reason =~ "dengesiz"
  end

  test "creates draft voucher and posts it atomically", %{acc_100: acc_100, acc_600: acc_600, acc_391: acc_391} do
    # 1. Create balanced sales voucher: Debit 100 Kasa 120 TL, Credit 600 Satışlar 100 TL, Credit 391 KDV 20 TL
    attrs = %{
      "voucher_type" => "FA",
      "description" => "Satış Fişi",
      "date" => Date.to_iso8601(Date.utc_today()),
      "lines" => [
        %{"account_id" => acc_100.id, "debit" => 120.0, "credit" => 0.0, "description" => "Tahsilat"},
        %{"account_id" => acc_600.id, "debit" => 0.0, "credit" => 100.0, "description" => "Satış Geliri"},
        %{"account_id" => acc_391.id, "debit" => 0.0, "credit" => 20.0, "description" => "KDV %20"}
      ]
    }

    assert {:ok, voucher} = Vouchers.create_voucher(attrs)
    assert voucher.status == "draft"
    assert Decimal.eq?(voucher.total_debit, Decimal.new("120.0"))
    assert Decimal.eq?(voucher.total_credit, Decimal.new("120.0"))

    # 2. Post voucher
    assert {:ok, posted_voucher} = Vouchers.post_voucher(voucher.id)
    assert posted_voucher.status == "posted"

    # 3. Check updated account balances
    updated_100 = Accounts.get_account!(acc_100.id)
    updated_600 = Accounts.get_account!(acc_600.id)
    updated_391 = Accounts.get_account!(acc_391.id)

    assert Decimal.eq?(updated_100.balance, Decimal.new("120.0")) # Normal D -> +120
    assert Decimal.eq?(updated_600.balance, Decimal.new("100.0")) # Normal C -> +100
    assert Decimal.eq?(updated_391.balance, Decimal.new("20.0"))  # Normal C -> +20

    # 4. Check Mizan report
    mizan = Mizan.generate_mizan()
    assert mizan.is_balanced == true
  end
end
