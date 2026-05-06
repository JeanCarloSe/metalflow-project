import { useEffect, useState } from 'react';
import DatabaseConnection from '../services/databaseConnection';

/**
 * Hook para gerenciar conexão com banco de dados
 */
export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    lastHealthCheck: null,
    reconnectAttempts: 0,
  });

  useEffect(() => {
    const dbConnection = DatabaseConnection.getInstance();

    // Inicializar conexão
    const initConnection = async () => {
      await dbConnection.initialize();
      setConnectionStatus(dbConnection.getStatus());
    };

    initConnection();

    // Listener para falhas de conexão
    const handleConnectionFailure = (event) => {
      console.warn('⚠️ [DB] Evento de falha de conexão:', event.detail);
      setConnectionStatus(dbConnection.getStatus());
    };

    window.addEventListener('dbConnectionFailed', handleConnectionFailure);

    // Atualizar status periodicamente
    const statusInterval = setInterval(() => {
      setConnectionStatus(dbConnection.getStatus());
    }, 10000); // A cada 10 segundos

    return () => {
      window.removeEventListener('dbConnectionFailed', handleConnectionFailure);
      clearInterval(statusInterval);
      // NÃO fazer destroy aqui, deixar conexão aberta durante a sessão
    };
  }, []);

  return connectionStatus;
};

export default useDatabaseConnection;
