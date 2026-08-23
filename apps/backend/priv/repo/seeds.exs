alias TdhpLedger.Repo
alias TdhpLedger.Accounts.Account
alias TdhpLedger.CurrentAccounts.CurrentAccount

# 1. Seed TDHP Main Classes (Headers)
class_headers = [
  %{code: "1", name: "DÖNEN VARLIKLAR", class_no: 1, normal_side: "D", is_header: true},
  %{code: "2", name: "DURAN VARLIKLAR", class_no: 2, normal_side: "D", is_header: true},
  %{code: "3", name: "KISA VADELİ YABANCI KAYNAKLAR", class_no: 3, normal_side: "C", is_header: true},
  %{code: "4", name: "UZUN VADELİ YABANCI KAYNAKLAR", class_no: 4, normal_side: "C", is_header: true},
  %{code: "5", name: "ÖZKAYNAKLAR", class_no: 5, normal_side: "C", is_header: true},
  %{code: "6", name: "GELİR TABLOSU HESAPLARI", class_no: 6, normal_side: "C", is_header: true},
  %{code: "7", name: "MALİYET HESAPLARI", class_no: 7, normal_side: "D", is_header: true},
  %{code: "8", name: "SERBEST HESAPLAR", class_no: 8, normal_side: "D", is_header: true},
  %{code: "9", name: "NAZIM HESAPLAR", class_no: 9, normal_side: "D", is_header: true}
]

Enum.each(class_headers, fn attrs ->
  case Repo.get_by(Account, code: attrs.code) do
    nil -> Repo.insert!(Account.changeset(%Account{}, attrs))
    _ -> :ok
  end
end)

# 2. Seed Standard Accounts
accounts = [
  %{code: "100", name: "Kasa", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "102", name: "Bankalar", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "120", name: "Alıcılar", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "153", name: "Ticari Mallar", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "157", name: "Diğer Stoklar", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "191", name: "İndirilecek KDV", class_no: 1, parent_code: "1", normal_side: "D"},
  %{code: "320", name: "Satıcılar", class_no: 3, parent_code: "3", normal_side: "C"},
  %{code: "335", name: "Personele Borçlar", class_no: 3, parent_code: "3", normal_side: "C"},
  %{code: "360", name: "Ödenecek Vergi ve Fonlar", class_no: 3, parent_code: "3", normal_side: "C"},
  %{code: "391", name: "Hesaplanan KDV", class_no: 3, parent_code: "3", normal_side: "C"},
  %{code: "600", name: "Yurtiçi Satışlar", class_no: 6, parent_code: "6", normal_side: "C"},
  %{code: "610", name: "Satıştan İadeler", class_no: 6, parent_code: "6", normal_side: "D"},
  %{code: "611", name: "Satış İskontoları", class_no: 6, parent_code: "6", normal_side: "D"}
]

Enum.each(accounts, fn attrs ->
  case Repo.get_by(Account, code: attrs.code) do
    nil -> Repo.insert!(Account.changeset(%Account{}, attrs))
    _ -> :ok
  end
end)

# 3. Seed Sample Current Accounts (Cari)
acc_120 = Repo.get_by!(Account, code: "120")
acc_320 = Repo.get_by!(Account, code: "320")
acc_335 = Repo.get_by!(Account, code: "335")

current_accounts = [
  %{code: "C-101", title: "Ahsen Teknoloji A.Ş.", type: "customer", tax_number: "1234567890", tax_office: "Karaköy", phone: "+90 212 555 0101", account_id: acc_120.id},
  %{code: "T-201", title: "Global Tedarik Ltd.", type: "supplier", tax_number: "9876543210", tax_office: "Mecidiyeköy", phone: "+90 212 555 0202", account_id: acc_320.id},
  %{code: "P-301", title: "Ahmet Yılmaz (Kasiyer)", type: "employee", tax_number: "11111111111", phone: "+90 532 555 0303", account_id: acc_335.id}
]

Enum.each(current_accounts, fn attrs ->
  case Repo.get_by(CurrentAccount, code: attrs.code) do
    nil -> Repo.insert!(CurrentAccount.changeset(%CurrentAccount{}, attrs))
    _ -> :ok
  end
end)

IO.puts("Successfully seeded TDHP 9-Class Accounts and Current Accounts!")
