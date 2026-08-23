defmodule TdhpLedger.Repo.Migrations.CreateVouchers do
  use Ecto.Migration

  def change do
    create table(:vouchers, primary_key: false) do
      add :id, :bigserial, primary_key: true
      add :voucher_number, :string, null: false
      add :voucher_type, :string, null: false # "FA" Satış, "ÖD" Ödeme, "GD" Gider, "TH" Tahsilat, "DZ" Düzeltme
      add :date, :date, null: false
      add :description, :text
      add :status, :string, null: false, default: "draft" # "draft", "posted", "cancelled"
      add :total_debit, :decimal, precision: 15, scale: 2, default: 0.0, null: false
      add :total_credit, :decimal, precision: 15, scale: 2, default: 0.0, null: false

      timestamps()
    end

    create unique_index(:vouchers, [:voucher_number])
    create index(:vouchers, [:voucher_type])
    create index(:vouchers, [:status])
    create index(:vouchers, [:date])
  end
end
