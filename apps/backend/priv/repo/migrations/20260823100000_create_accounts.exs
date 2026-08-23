defmodule TdhpLedger.Repo.Migrations.CreateAccounts do
  use Ecto.Migration

  def change do
    create table(:accounts, primary_key: false) do
      add :id, :bigserial, primary_key: true
      add :code, :string, null: false
      add :name, :string, null: false
      add :class_no, :integer, null: false
      add :parent_code, :string
      add :normal_side, :string, null: false, default: "D" # "D" (Debit/Borç) or "C" (Credit/Alacak)
      add :balance, :decimal, precision: 15, scale: 2, default: 0.0, null: false
      add :is_active, :boolean, default: true, null: false
      add :is_header, :boolean, default: false, null: false

      timestamps()
    end

    create unique_index(:accounts, [:code])
    create index(:accounts, [:class_no])
    create index(:accounts, [:parent_code])
  end
end
