import React, { useState, useEffect } from 'react';
import MultiUserService from '../services/multiUserService';

const UserSessionPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const multiUserService = MultiUserService.getInstance();

    const updateSessions = () => {
      setSessions(multiUserService.getActiveSessions());
      setStats(multiUserService.getSessionStats());
    };

    updateSessions();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateSessions, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats || sessions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-64 overflow-y-auto z-40">
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">Sessões Ativas</h3>
        <p className="text-xs text-gray-600">Total: {stats.activeSessions}</p>
      </div>

      <div className="space-y-2">
        {sessions.map(session => (
          <div key={session.userId} className="p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold">{session.name}</p>
                <p className="text-xs text-gray-600">{session.login}</p>
              </div>
              {session.isCurrentUser && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Você</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Login: {new Date(session.loginTime).toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500">
              Ativo: {new Date(session.lastActivity).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSessionPanel;
