defmodule TdhpLedger.Repo.Migrations.CreateAuditLogs do
  use Ecto.Migration

  def change do
    create table(:audit_logs, primary_key: false) do
      add :id, :bigserial, primary_key: true
      add :entity_type, :string, null: false
      add :entity_id, :string, null: false
      add :action, :string, null: false # "CREATE", "POST", "CANCEL", "UPDATE"
      add :payload, :map
      add :actor, :string, default: "system"

      timestamps(updated_at: false)
    end

    create index(:audit_logs, [:entity_type, :entity_id])
  end
end
