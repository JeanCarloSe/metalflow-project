import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSync from '../hooks/useSync.js';

/**
 * 🔄 SyncIndicator - Mostra status de sincronização
 */
const SyncIndicator = () => {
  const { isOnline, isSyncing, lastSyncTime, pendingChanges, notifications } = useSync();

  return (
    <>
      {/* Status bar (canto inferior direito) */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Online/Offline indicator */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg">
          {/* Status dot */}
          <motion.div
            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            animate={isSyncing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: isSyncing ? Infinity : 0, duration: 1 }}
          />

          {/* Text */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-900">
              {isSyncing ? '🔄 Sincronizando...' : isOnline ? '✅ Online' : '❌ Offline'}
            </span>

            {lastSyncTime && (
              <span className="text-xs text-gray-600">
                Último sync: {new Date(lastSyncTime).toLocaleTimeString()}
              </span>
            )}

            {pendingChanges > 0 && (
              <span className="text-xs text-orange-600 font-medium">
                {pendingChanges} mudança{pendingChanges !== 1 ? 's' : ''} pendente{pendingChanges !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className="fixed top-6 right-6 z-50"
            style={{ top: `${24 + index * 80}px` }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div
              className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {notification.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default SyncIndicator;
