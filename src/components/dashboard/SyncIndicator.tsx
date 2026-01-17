'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Users } from 'lucide-react';
import { SyncStatus } from '@/hooks/useSync';

interface SyncIndicatorProps {
  status: SyncStatus;
  connectedUsers: number;
  lastSyncTime?: Date | null;
  userNames?: string[];
}

export default function SyncIndicator({ status, connectedUsers, lastSyncTime, userNames = [] }: SyncIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'syncing': return 'text-white';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'syncing': return 'Syncing...';
      default: return 'Offline';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = ['bg-white', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700">
      {/* Status indicator with pulse */}
      <motion.div 
        className={`flex items-center gap-1.5 ${getStatusColor()}`}
        animate={status === 'syncing' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: status === 'syncing' ? Infinity : 0 }}
      >
        {getStatusIcon()}
        <span className="text-xs font-mono hidden sm:inline">{getStatusText()}</span>
      </motion.div>

      {/* Connected users with avatars */}
      <AnimatePresence>
        {status === 'connected' && connectedUsers > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* User avatars */}
            <div className="flex -space-x-2">
              {(userNames.length > 0 ? userNames : ['You']).slice(0, 3).map((name, i) => (
                <motion.div
                  key={i}
                  className={`w-6 h-6 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-[10px] font-bold text-white border-2 border-gray-900`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {getInitials(name)}
                </motion.div>
              ))}
              {connectedUsers > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 border-2 border-gray-900">
                  +{connectedUsers - 3}
                </div>
              )}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && userNames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs font-mono z-50 min-w-[120px]"
                >
                  <div className="text-gray-400 mb-1">Connected:</div>
                  {userNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 py-0.5">
                      <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                      <span className="text-gray-300">{name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync pulse animation */}
      <AnimatePresence>
        {status === 'syncing' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 2, 1],
              opacity: [1, 0, 1]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </AnimatePresence>

      {/* Last sync time */}
      {lastSyncTime && status === 'connected' && (
        <span className="text-[10px] sm:text-xs text-gray-600 font-mono hidden sm:inline">
          {formatSyncTime(lastSyncTime)}
        </span>
      )}
    </div>
  );
}

function formatSyncTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString();
}
