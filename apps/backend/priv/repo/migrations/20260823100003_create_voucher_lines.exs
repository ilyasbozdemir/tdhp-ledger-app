defmodule TdhpLedger.Repo.Migrations.CreateVoucherLines do
  use Ecto.Migration

  def change do
    create table(:voucher_lines, primary_key: false) do
      add :id, :bigserial, primary_key: true
      add :voucher_id, references(:vouchers, on_delete: :delete_all, type: :bigserial), null: false
      add :account_id, references(:accounts, on_delete: :restrict, type: :bigserial), null: false
      add :current_account_id, references(:current_accounts, on_delete: :nilify_all, type: :bigserial)
      add :debit, :decimal, precision: 15, scale: 2, default: 0.0, null: false
      add :credit, :decimal, precision: 15, scale: 2, default: 0.0, null: false
      add :description, :string

      timestamps()
    end

    create index(:voucher_lines, [:voucher_id])
    create index(:voucher_lines, [:account_id])
    create index(:voucher_lines, [:current_account_id])
  end
end
