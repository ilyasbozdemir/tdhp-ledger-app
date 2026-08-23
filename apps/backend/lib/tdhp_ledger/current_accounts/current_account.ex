defmodule TdhpLedger.CurrentAccounts.CurrentAccount do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :code, :title, :type, :tax_number, :tax_office, :phone, :address, :account_id, :account, :inserted_at, :updated_at]}
  schema "current_accounts" do
    field :code, :string
    field :title, :string
    field :type, :string # "customer", "supplier", "employee", "cashier"
    field :tax_number, :string
    field :tax_office, :string
    field :phone, :string
    field :address, :string

    belongs_to :account, TdhpLedger.Accounts.Account

    timestamps()
  end

  @doc false
  def changeset(current_account, attrs) do
    current_account
    |> cast(attrs, [:code, :title, :type, :tax_number, :tax_office, :phone, :address, :account_id])
    |> validate_required([:code, :title, :type])
    |> validate_inclusion(:type, ["customer", "supplier", "employee", "cashier"])
    |> unique_constraint(:code)
  end
end
