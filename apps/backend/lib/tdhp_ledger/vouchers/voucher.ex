defmodule TdhpLedger.Vouchers.Voucher do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :voucher_number, :voucher_type, :date, :description, :status, :total_debit, :total_credit, :lines, :inserted_at, :updated_at]}
  schema "vouchers" do
    field :voucher_number, :string
    field :voucher_type, :string # "FA", "ÖD", "GD", "TH", "DZ"
    field :date, :date
    field :description, :string
    field :status, :string, default: "draft" # "draft", "posted", "cancelled"
    field :total_debit, :decimal, default: Decimal.new("0.0")
    field :total_credit, :decimal, default: Decimal.new("0.0")

    has_many :lines, TdhpLedger.Vouchers.VoucherLine, on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(voucher, attrs) do
    voucher
    |> cast(attrs, [:voucher_number, :voucher_type, :date, :description, :status, :total_debit, :total_credit])
    |> cast_assoc(:lines, required: true, with: &TdhpLedger.Vouchers.VoucherLine.changeset/2)
    |> validate_required([:voucher_number, :voucher_type, :date])
    |> validate_inclusion(:voucher_type, ["FA", "ÖD", "GD", "TH", "DZ"])
    |> validate_inclusion(:status, ["draft", "posted", "cancelled"])
    |> unique_constraint(:voucher_number)
  end
end
