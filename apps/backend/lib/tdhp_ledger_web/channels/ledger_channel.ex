defmodule TdhpLedgerWeb.LedgerChannel do
  use TdhpLedgerWeb, :channel

  @impl true
  def join("ledger:lobby", _payload, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end
end
