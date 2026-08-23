defmodule TdhpLedger.Audit do
  @moduledoc """
  Immutable audit logger.
  """
  import Ecto.Query, warn: false
  alias TdhpLedger.Repo
  alias TdhpLedger.Audit.AuditLog

  def log(entity_type, entity_id, action, payload \\ %{}, actor \\ "system") do
    %AuditLog{}
    |> AuditLog.changeset(%{
      entity_type: to_string(entity_type),
      entity_id: to_string(entity_id),
      action: to_string(action),
      payload: payload,
      actor: actor
    })
    |> Repo.insert()
  end

  def list_logs do
    AuditLog
    |> order_by([a], desc: a.inserted_at)
    |> limit(100)
    |> Repo.all()
  end
end
