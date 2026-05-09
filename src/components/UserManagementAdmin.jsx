import React, { useState } from 'react';
import MultiUserService from '../services/multiUserService';
import useMultiUser from '../hooks/useMultiUser';

const UserManagementAdmin = () => {
  const { sessions, stats, currentUser } = useMultiUser();
  const [showDetails, setShowDetails] = useState(null);

  const multiUserService = MultiUserService.getInstance();

  const getUserPermissions = (userId) => {
    return multiUserService.permissions.get(userId);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">❌ Apenas administradores podem acessar este painel</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">Nenhuma sessão ativa no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600">Sessões Ativas</p>
            <p className="text-3xl font-bold text-blue-900">{stats.activeSessions}</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-600">Usuário Atual</p>
            <p className="text-lg font-bold text-purple-900">{stats.currentUser}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">Duração da Sessão</p>
            <p className="text-lg font-bold text-green-900">{stats.sessionDuration}</p>
          </div>
        </div>
      )}

      {/* Sessões */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-6 py-3 border-b">
          <h3 className="font-bold text-lg">👥 Gerenciamento de Usuários</h3>
        </div>

        <div className="divide-y">
          {sessions.map((session) => {
            const perms = getUserPermissions(session.userId);
            const isExpanded = showDetails === session.userId;

            return (
              <div key={session.userId} className="hover:bg-gray-50 transition">
                <div
                  onClick={() => setShowDetails(isExpanded ? null : session.userId)}
                  className="p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold">{session.name}</span>
                      {session.isCurrentUser && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Você</span>
                      )}
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {session.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{session.login} • {session.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Login: {new Date(session.loginTime).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                {isExpanded && perms && (
                  <div className="px-6 py-4 bg-gray-50 border-t space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Permissões</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Criar</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {perms.canCreate.map(r => (
                              <span key={r} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Atualizar</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {perms.canUpdate.map(r => (
                              <span key={r} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Ler</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {perms.canRead.map(r => (
                              <span key={r} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Deletar</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {perms.canDelete.length === 0 ? (
                              <span className="text-xs text-gray-500">Sem permissão</span>
                            ) : (
                              perms.canDelete.map(r => (
                                <span key={r} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                  {r}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className={`text-xs px-2 py-1 rounded ${perms.isAdmin ? 'bg-purple-100 text-purple-700 font-semibold' : 'bg-gray-100 text-gray-700'}`}>
                          {perms.isAdmin ? '👑 Administrador' : 'Operador'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserManagementAdmin;
