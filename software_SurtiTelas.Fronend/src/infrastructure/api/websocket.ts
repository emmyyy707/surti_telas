const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined)?.replace(/\/$/, '') ?? 'ws://localhost:3000';

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private connected = false;

  connect(token?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const url = `${WS_URL}/ws?token=${encodeURIComponent(token ?? '')}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.connected = true;
      this.reconnectDelay = 1000;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { event: eventName, data } = message;
        const handlers = this.listeners.get(eventName);
        if (handlers) {
          for (const handler of handlers) {
            handler(data);
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.connected = false;
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsService = new WebSocketService();
