defmodule TdhpLedger.Vouchers.VoucherLine do
  use Ecto.Schema
  import Ecto.Changeset

  schema "voucher_lines" do
    field :debit, :decimal, default: Decimal.new("0.0")
    field :credit, :decimal, default: Decimal.new("0.0")
    field :description, :string

    belongs_to :voucher, TdhpLedger.Vouchers.Voucher
    belongs_to :account, TdhpLedger.Accounts.Account
    belongs_to :current_account, TdhpLedger.CurrentAccounts.CurrentAccount

    timestamps()
  end

  @doc false
  def changeset(line, attrs) do
    line
    |> cast(attrs, [:account_id, :current_account_id, :debit, :credit, :description])
    |> validate_required([:account_id])
    |> validate_debit_or_credit()
  end

  defp validate_debit_or_credit(changeset) do
    debit = get_field(changeset, :debit) || Decimal.new("0.0")
    credit = get_field(changeset, :credit) || Decimal.new("0.0")

    if Decimal.gt?(debit, 0) or Decimal.gt?(credit, 0) do
      changeset
    else
      add_error(changeset, :debit, "En az bir borç (debit) veya alacak (credit) tutarı sıfırdan büyük olmalıdır")
    end
  end
end
