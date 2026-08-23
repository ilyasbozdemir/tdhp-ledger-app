defmodule TdhpLedger.Repo.Migrations.CreateCurrentAccounts do
  use Ecto.Migration

  def change do
    create table(:current_accounts, primary_key: false) do
      add :id, :bigserial, primary_key: true
      add :code, :string, null: false
      add :title, :string, null: false
      add :type, :string, null: false # "customer", "supplier", "employee", "cashier"
      add :tax_number, :string
      add :tax_office, :string
      add :phone, :string
      add :address, :text
      add :account_id, references(:accounts, on_delete: :nothing, type: :bigserial)

      timestamps()
    end

    create unique_index(:current_accounts, [:code])
    create index(:current_accounts, [:type])
    create index(:current_accounts, [:account_id])
  end
end
