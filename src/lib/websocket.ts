'use client';

type TelemetryListener = (data: Record<string, unknown>) => void;

class CampusWebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Set<TelemetryListener> = new Set();
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private simulatedInterval: NodeJS.Timeout | null = null;

  constructor(url: string = 'ws://localhost:8000/ws/telemetry') {
    this.url = url;
  }

  public connect(): void {
    if (typeof window === 'undefined') return;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.stopSimulatedTelemetry();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notifyListeners(parsed);
        } catch {
          // ignore malformed frame
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
        this.startSimulatedTelemetry();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        this.startSimulatedTelemetry();
      };
    } catch {
      this.isConnected = false;
      this.startSimulatedTelemetry();
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    if (!this.isConnected && !this.simulatedInterval) {
      this.startSimulatedTelemetry();
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(data: Record<string, unknown>): void {
    this.listeners.forEach(listener => listener(data));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 10000);
  }

  // Fallback simulator providing periodic micro-telemetry fluctuations
  private startSimulatedTelemetry(): void {
    if (this.simulatedInterval || typeof window === 'undefined') return;
    this.simulatedInterval = setInterval(() => {
      const deltaKw = (Math.random() - 0.5) * 6;
      const deltaWater = (Math.random() - 0.5) * 2;
      this.notifyListeners({
        type: 'TELEMETRY_PULSE',
        timestamp: new Date().toISOString(),
        deltaKw,
        deltaWater,
        connectedToLiveServer: this.isConnected
      });
    }, 4000);
  }

  private stopSimulatedTelemetry(): void {
    if (this.simulatedInterval) {
      clearInterval(this.simulatedInterval);
      this.simulatedInterval = null;
    }
  }

  public disconnect(): void {
    this.stopSimulatedTelemetry();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const campusWebSocket = new CampusWebSocketClient();
