import { useEffect, useState } from 'react';
import MultiUserService from '../services/multiUserService';

/**
 * 👥 Hook para acessar funcionalidades de múltiplos usuários
 * Retorna dados do usuário atual, permissões e métodos úteis
 */
export const useMultiUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const multiUserService = MultiUserService.getInstance();

    const updateState = () => {
      const user = multiUserService.getCurrentUser();
      const tenant = multiUserService.getCurrentTenant();
      const userSessions = multiUserService.getActiveSessions();
      const sessionStats = multiUserService.getSessionStats();
      const authenticated = multiUserService.isAuthenticated();

      setCurrentUser(user);
      setCurrentTenant(tenant);
      setSessions(userSessions);
      setStats(sessionStats);
      setIsAuthenticated(authenticated);
    };

    updateState();

    // Listeners para eventos
    multiUserService.on('userLoggedIn', updateState);
    multiUserService.on('userLoggedOut', updateState);

    // Atualizar estado a cada 5 segundos
    const interval = setInterval(updateState, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const hasPermission = (action, resource) => {
    const multiUserService = MultiUserService.getInstance();
    return multiUserService.hasPermission(action, resource);
  };

  const logout = async () => {
    const multiUserService = MultiUserService.getInstance();
    await multiUserService.logout();
  };

  return {
    currentUser,
    currentTenant,
    sessions,
    stats,
    isAuthenticated,
    hasPermission,
    logout,
  };
};

export default useMultiUser;
