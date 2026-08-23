defmodule TdhpLedger.Accounts do
  @moduledoc """
  The Accounts context for managing TDHP Account Plan (1-9 Classes).
  """
  import Ecto.Query, warn: false
  alias TdhpLedger.Repo
  alias TdhpLedger.Accounts.Account

  def list_accounts do
    Account
    |> order_by([a], asc: a.code)
    |> Repo.all()
  end

  def get_account!(id), do: Repo.get!(Account, id)

  def get_account_by_code(code) do
    Repo.get_by(Account, code: code)
  end

  def create_account(attrs \\ %{}) do
    # Automatically infer class_no and normal_side from account code first digit if not provided
    attrs = infer_account_metadata(attrs)

    %Account{}
    |> Account.changeset(attrs)
    |> Repo.insert()
  end

  def update_account(%Account{} = account, attrs) do
    account
    |> Account.changeset(attrs)
    |> Repo.update()
  end

  def delete_account(%Account{} = account) do
    Repo.delete(account)
  end

  def change_account(%Account{} = account, attrs \\ %{}) do
    Account.changeset(account, attrs)
  end

  # Determine class and default normal side (Borç D / Alacak C) based on TDHP rules
  defp infer_account_metadata(%{"code" => code} = attrs) when is_binary(code) and code != "" do
    first_char = String.first(code)
    class_no = String.to_integer(first_char)

    normal_side =
      case class_no do
        1 -> "D" # Dönen Varlıklar
        2 -> "D" # Duran Varlıklar
        3 -> "C" # Kısa Vadeli Yabancı Kaynaklar
        4 -> "C" # Uzun Vadeli Yabancı Kaynaklar
        5 -> "C" # Özkaynaklar
        6 -> if String.starts_with?(code, ["600", "601", "602"]), do: "C", else: "D" # Sales C, Costs D
        7 -> "D" # Maliyet Hesapları
        8 -> "D"
        9 -> "D" # Nazım Hesaplar
        _ -> "D"
      end

    attrs
    |> Map.put_new("class_no", class_no)
    |> Map.put_new("normal_side", normal_side)
  end

  defp infer_account_metadata(attrs), do: attrs
end
