'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketService, SyncEvent, HypothesisEvent, StateSyncEvent, getMockWebSocketService } from '@/lib/websocket';
import { Hypothesis } from '@/types/project';

interface UseSyncOptions {
  enabled?: boolean;
  wsUrl?: string;
  onHypothesisAdd?: (hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => void;
  onHypothesisUpdate?: (hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => void;
  onHypothesisDelete?: (hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => void;
  onStateSync?: (state: { hypotheses: Hypothesis[]; solutions: Hypothesis[]; requirements: Hypothesis[] }) => void;
  onUserJoin?: (userId: string) => void;
  onUserLeave?: (userId: string) => void;
}

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing';

export function useSync(options: UseSyncOptions = {}) {
  const {
    enabled = false,
    wsUrl = 'ws://localhost:3001',
    onHypothesisAdd,
    onHypothesisUpdate,
    onHypothesisDelete,
    onStateSync,
    onUserJoin,
    onUserLeave,
  } = options;

  const [status, setStatus] = useState<SyncStatus>('disconnected');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocketService | null>(null);
  const syncingRef = useRef(false);

  // Initialize WebSocket service
  useEffect(() => {
    if (!enabled) {
      setStatus('disconnected');
      return;
    }

    // Use mock service when WebSocket server unavailable
    const ws = wsUrl.includes('mock') ? getMockWebSocketService() : new WebSocketService(wsUrl);
    wsRef.current = ws;

    ws.setConnectionChangeHandler((state) => {
      setStatus(state);
    });

    // Set up event listeners
    ws.on('hypothesis:add', (event: SyncEvent) => {
      const { hypothesis, column } = (event as HypothesisEvent).payload;
      onHypothesisAdd?.(hypothesis, column);
      showSyncIndicator();
    });

    ws.on('hypothesis:update', (event: SyncEvent) => {
      const { hypothesis, column } = (event as HypothesisEvent).payload;
      onHypothesisUpdate?.(hypothesis, column);
      showSyncIndicator();
    });

    ws.on('hypothesis:delete', (event: SyncEvent) => {
      const { hypothesis, column } = (event as HypothesisEvent).payload;
      onHypothesisDelete?.(hypothesis, column);
      showSyncIndicator();
    });

    ws.on('state:sync', (event: SyncEvent) => {
      const state = (event as StateSyncEvent).payload;
      onStateSync?.(state);
      setLastSyncTime(new Date());
      showSyncIndicator();
    });

    ws.on('user:join', (event: SyncEvent) => {
      const { userId } = event.payload as { userId: string };
      setConnectedUsers(prev => [...prev.filter(id => id !== userId), userId]);
      onUserJoin?.(userId);
    });

    ws.on('user:leave', (event: SyncEvent) => {
      const { userId } = event.payload as { userId: string };
      setConnectedUsers(prev => prev.filter(id => id !== userId));
      onUserLeave?.(userId);
    });

    // Connect
    ws.connect().catch(console.error);

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [enabled, wsUrl]);

  const showSyncIndicator = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setStatus('syncing');
    setTimeout(() => {
      syncingRef.current = false;
      setStatus('connected');
    }, 500);
  }, []);

  // Broadcast functions
  const broadcastAdd = useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
    wsRef.current?.broadcastHypothesisAdd(hypothesis, column);
  }, []);

  const broadcastUpdate = useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
    wsRef.current?.broadcastHypothesisUpdate(hypothesis, column);
  }, []);

  const broadcastDelete = useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
    wsRef.current?.broadcastHypothesisDelete(hypothesis, column);
  }, []);

  const broadcastStateSync = useCallback((state: { hypotheses: Hypothesis[]; solutions: Hypothesis[]; requirements: Hypothesis[] }) => {
    wsRef.current?.broadcastStateSync(state);
  }, []);

  return {
    status,
    connectedUsers,
    lastSyncTime,
    broadcastAdd,
    broadcastUpdate,
    broadcastDelete,
    broadcastStateSync,
    isConnected: status === 'connected' || status === 'syncing',
    isSyncing: status === 'syncing',
  };
}
