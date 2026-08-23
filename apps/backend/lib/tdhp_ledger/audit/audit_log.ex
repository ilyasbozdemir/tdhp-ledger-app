defmodule TdhpLedger.Audit.AuditLog do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :entity_type, :entity_id, :action, :payload, :actor, :inserted_at]}
  schema "audit_logs" do
    field :entity_type, :string
    field :entity_id, :string
    field :action, :string
    field :payload, :map
    field :actor, :string, default: "system"

    timestamps(updated_at: false)
  end

  def changeset(audit_log, attrs) do
    audit_log
    |> cast(attrs, [:entity_type, :entity_id, :action, :payload, :actor])
    |> validate_required([:entity_type, :entity_id, :action])
  end
end
