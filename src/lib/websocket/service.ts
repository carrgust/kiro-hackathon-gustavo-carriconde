import { Hypothesis } from '@/types/project';

export type SyncEventType = 
  | 'hypothesis:add'
  | 'hypothesis:update'
  | 'hypothesis:delete'
  | 'state:sync'
  | 'user:join'
  | 'user:leave';

export interface SyncEvent {
  type: SyncEventType;
  payload: unknown;
  userId: string;
  timestamp: number;
}

export interface HypothesisEvent extends SyncEvent {
  type: 'hypothesis:add' | 'hypothesis:update' | 'hypothesis:delete';
  payload: {
    hypothesis: Hypothesis;
    column: 'hypotheses' | 'solutions' | 'requirements';
  };
}

export interface StateSyncEvent extends SyncEvent {
  type: 'state:sync';
  payload: {
    hypotheses: Hypothesis[];
    solutions: Hypothesis[];
    requirements: Hypothesis[];
  };
}

export interface UserEvent extends SyncEvent {
  type: 'user:join' | 'user:leave';
  payload: {
    userId: string;
    userName?: string;
  };
}

type EventCallback = (event: SyncEvent) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<SyncEventType | 'all', Set<EventCallback>> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private onConnectionChange?: (state: 'disconnected' | 'connecting' | 'connected') => void;

  constructor(url: string, userId?: string) {
    this.url = url;
    this.userId = userId || this.generateUserId();
  }

  private generateUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setConnectionChangeHandler(handler: (state: 'disconnected' | 'connecting' | 'connected') => void) {
    this.onConnectionChange = handler;
  }

  private updateConnectionState(state: 'disconnected' | 'connecting' | 'connected') {
    this.connectionState = state;
    this.onConnectionChange?.(state);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.updateConnectionState('connecting');

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.updateConnectionState('connected');
          this.send({ type: 'user:join', payload: { userId: this.userId } });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as SyncEvent;
            this.emit(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        this.ws.onclose = () => {
          this.updateConnectionState('disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        this.updateConnectionState('disconnected');
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
      this.connect().catch(() => {});
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.send({ type: 'user:leave', payload: { userId: this.userId } });
      this.ws.close();
      this.ws = null;
    }
    this.updateConnectionState('disconnected');
  }

  send(event: Omit<SyncEvent, 'userId' | 'timestamp'>) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const fullEvent: SyncEvent = {
      ...event,
      userId: this.userId,
      timestamp: Date.now(),
    } as SyncEvent;

    this.ws.send(JSON.stringify(fullEvent));
  }

  on(eventType: SyncEventType | 'all', callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: SyncEventType | 'all', callback: EventCallback) {
    this.listeners.get(eventType)?.delete(callback);
  }

  private emit(event: SyncEvent) {
    // Skip events from self
    if (event.userId === this.userId) return;

    // Emit to specific listeners
    this.listeners.get(event.type)?.forEach(cb => cb(event));
    // Emit to 'all' listeners
    this.listeners.get('all')?.forEach(cb => cb(event));
  }

  getConnectionState() {
    return this.connectionState;
  }

  getUserId() {
    return this.userId;
  }

  // Convenience methods for hypothesis sync
  broadcastHypothesisAdd(hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') {
    this.send({
      type: 'hypothesis:add',
      payload: { hypothesis, column },
    });
  }

  broadcastHypothesisUpdate(hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') {
    this.send({
      type: 'hypothesis:update',
      payload: { hypothesis, column },
    });
  }

  broadcastHypothesisDelete(hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') {
    this.send({
      type: 'hypothesis:delete',
      payload: { hypothesis, column },
    });
  }

  broadcastStateSync(state: { hypotheses: Hypothesis[]; solutions: Hypothesis[]; requirements: Hypothesis[] }) {
    this.send({
      type: 'state:sync',
      payload: state,
    });
  }
}

// Singleton instance for mock mode (when no WebSocket server available)
let mockInstance: WebSocketService | null = null;

export function getMockWebSocketService(): WebSocketService {
  if (!mockInstance) {
    mockInstance = new MockWebSocketService();
  }
  return mockInstance;
}

// Mock implementation when WebSocket server is unavailable
class MockWebSocketService extends WebSocketService {
  constructor() {
    super('ws://localhost:3001');
  }

  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setConnectionChangeHandler?.call(this, () => {});
        resolve();
      }, 500);
    });
  }

  disconnect() {
    // No-op for mock
  }

  send() {
    // No-op for mock - events stay local
  }
}
