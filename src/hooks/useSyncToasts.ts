'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type ToastType = 'sync' | 'user' | 'hypothesis' | 'error';

interface SyncToastOptions {
  type: ToastType;
  message: string;
  description?: string;
}

export function useSyncToasts() {
  const showToast = useCallback(({ type, message, description }: SyncToastOptions) => {
    const icons: Record<ToastType, string> = {
      sync: '🔄',
      user: '👤',
      hypothesis: '💡',
      error: '❌',
    };

    const styles: Record<ToastType, { className: string }> = {
      sync: { className: 'bg-cyan-900/50 border-cyan-700' },
      user: { className: 'bg-green-900/50 border-green-700' },
      hypothesis: { className: 'bg-purple-900/50 border-purple-700' },
      error: { className: 'bg-red-900/50 border-red-700' },
    };

    toast(message, {
      description,
      icon: icons[type],
      duration: type === 'error' ? 5000 : 3000,
      className: `font-mono text-sm ${styles[type].className}`,
    });
  }, []);

  const showUserJoined = useCallback((userId: string) => {
    showToast({
      type: 'user',
      message: 'User joined',
      description: `${userId.slice(0, 12)}... connected`,
    });
  }, [showToast]);

  const showUserLeft = useCallback((userId: string) => {
    showToast({
      type: 'user',
      message: 'User left',
      description: `${userId.slice(0, 12)}... disconnected`,
    });
  }, [showToast]);

  const showHypothesisAdded = useCallback((column: string) => {
    showToast({
      type: 'hypothesis',
      message: 'New hypothesis',
      description: `Added to ${column}`,
    });
  }, [showToast]);

  const showHypothesisUpdated = useCallback((column: string) => {
    showToast({
      type: 'hypothesis',
      message: 'Hypothesis updated',
      description: `Updated in ${column}`,
    });
  }, [showToast]);

  const showStateSynced = useCallback(() => {
    showToast({
      type: 'sync',
      message: 'State synced',
      description: 'Received latest data',
    });
  }, [showToast]);

  const showConnectionError = useCallback(() => {
    showToast({
      type: 'error',
      message: 'Connection lost',
      description: 'Attempting to reconnect...',
    });
  }, [showToast]);

  const showReconnected = useCallback(() => {
    showToast({
      type: 'sync',
      message: 'Reconnected',
      description: 'Real-time sync restored',
    });
  }, [showToast]);

  return {
    showToast,
    showUserJoined,
    showUserLeft,
    showHypothesisAdded,
    showHypothesisUpdated,
    showStateSynced,
    showConnectionError,
    showReconnected,
  };
}
