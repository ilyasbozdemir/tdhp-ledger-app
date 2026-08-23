defmodule TdhpLedger.Accounts.Account do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :code, :name, :class_no, :parent_code, :normal_side, :balance, :is_active, :is_header, :inserted_at, :updated_at]}
  schema "accounts" do
    field :code, :string
    field :name, :string
    field :class_no, :integer
    field :parent_code, :string
    field :normal_side, :string, default: "D" # "D" or "C"
    field :balance, :decimal, default: Decimal.new("0.0")
    field :is_active, :boolean, default: true
    field :is_header, :boolean, default: false

    timestamps()
  end

  @doc false
  def changeset(account, attrs) do
    account
    |> cast(attrs, [:code, :name, :class_no, :parent_code, :normal_side, :balance, :is_active, :is_header])
    |> validate_required([:code, :name, :class_no, :normal_side])
    |> validate_inclusion(:class_no, 1..9)
    |> validate_inclusion(:normal_side, ["D", "C"])
    |> unique_constraint(:code)
  end
end
