import { Socket, Channel } from "phoenix";

class PhoenixSocketManager {
  private socket: Socket | null = null;
  private channel: Channel | null = null;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();

  public connect(url: string = "ws://localhost:4000/socket"): Socket {
    if (this.socket) return this.socket;

    this.socket = new Socket(url, {
      params: {},
    });

    this.socket.connect();

    this.channel = this.socket.channel("ledger:lobby", {});
    this.channel
      .join()
      .receive("ok", () => console.log("[PhoenixSocket] Joined ledger:lobby successfully"))
      .receive("error", (resp) => console.error("[PhoenixSocket] Unable to join ledger:lobby", resp));

    // Register event listeners
    this.channel.on("voucher_posted", (msg) => this.notify("voucher_posted", msg));
    this.channel.on("voucher_cancelled", (msg) => this.notify("voucher_cancelled", msg));

    return this.socket;
  }

  public subscribe(event: string, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const arr = this.listeners.get(event);
      if (arr) {
        this.listeners.set(
          event,
          arr.filter((cb) => cb !== callback)
        );
      }
    };
  }

  private notify(event: string, payload: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.channel = null;
    }
  }
}

export const socketManager = new PhoenixSocketManager();
