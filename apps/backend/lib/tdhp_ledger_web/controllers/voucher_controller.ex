defmodule TdhpLedgerWeb.VoucherController do
  use TdhpLedgerWeb, :controller
  alias TdhpLedger.Vouchers

  def index(conn, _params) do
    vouchers = Vouchers.list_vouchers()
    json(conn, %{data: vouchers})
  end

  def show(conn, %{"id" => id}) do
    voucher = Vouchers.get_voucher!(id)
    json(conn, %{data: voucher})
  end

  def create(conn, params) do
    case Vouchers.create_voucher(params) do
      {:ok, voucher} ->
        conn
        |> put_status(:created)
        |> json(%{data: voucher})

      {:error, reason} when is_binary(reason) ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_errors(changeset)})
    end
  end

  def post(conn, %{"id" => id}) do
    case Vouchers.post_voucher(id) do
      {:ok, voucher} ->
        json(conn, %{message: "Fiş başarıyla deftere nakledildi.", data: voucher})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  def cancel(conn, %{"id" => id}) do
    case Vouchers.cancel_voucher(id) do
      {:ok, voucher} ->
        json(conn, %{message: "Fiş iptal edildi.", data: voucher})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  defp format_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        to_string(Map.get(opts, String.to_existing_atom(key), key))
      end)
    end)
  end
end
