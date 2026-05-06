/**
 * 🔌 DatabaseConnection - Gerencia conexão resiliente com banco de dados
 * Reconnexão automática, health checks e fallback
 */

import DatabasePool from './databasePool';

class DatabaseConnection {
  static instance = null;
  static isConnected = false;
  static lastHealthCheck = null;
  static healthCheckInterval = null;
  static reconnectAttempts = 0;
  static maxReconnectAttempts = 5;
  static reconnectDelay = 1000; // ms

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseConnection();
    }
    return this.instance;
  }

  /**
   * Inicializar conexão com health check periódico
   */
  async initialize() {
    try {
      console.log('🔌 [DB] Inicializando conexão...');
      const pool = DatabasePool.getInstance();
      await pool.getDB();

      DatabaseConnection.isConnected = true;
      DatabaseConnection.reconnectAttempts = 0;
      console.log('✅ [DB] Banco de dados conectado com sucesso');

      // Iniciar health checks periódicos
      this.startHealthChecks();

      return true;
    } catch (error) {
      console.error('❌ [DB] Erro ao conectar:', error);
      DatabaseConnection.isConnected = false;
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Health check periódico (a cada 30 segundos)
   */
  startHealthChecks() {
    if (DatabaseConnection.healthCheckInterval) {
      clearInterval(DatabaseConnection.healthCheckInterval);
    }

    DatabaseConnection.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.performHealthCheck();

      if (!isHealthy && DatabaseConnection.isConnected) {
        console.warn('⚠️ [DB] Perda de conexão detectada. Tentando reconectar...');
        DatabaseConnection.isConnected = false;
        this.scheduleReconnect();
      }
    }, 30000); // A cada 30 segundos
  }

  /**
   * Executar health check
   */
  async performHealthCheck() {
    try {
      const pool = DatabasePool.getInstance();
      const result = await pool.healthCheck();

      DatabaseConnection.lastHealthCheck = {
        timestamp: new Date(),
        status: result ? 'healthy' : 'unhealthy',
      };

      if (result) {
        DatabaseConnection.isConnected = true;
        DatabaseConnection.reconnectAttempts = 0;
      }

      return result;
    } catch (error) {
      console.error('❌ [DB] Health check falhou:', error);
      return false;
    }
  }

  /**
   * Reconectar com retry exponencial
   */
  scheduleReconnect() {
    if (DatabaseConnection.reconnectAttempts >= DatabaseConnection.maxReconnectAttempts) {
      console.error('❌ [DB] Máximo de tentativas de reconexão atingido');
      this.notifyConnectionFailure();
      return;
    }

    const delay = DatabaseConnection.reconnectDelay * Math.pow(2, DatabaseConnection.reconnectAttempts);
    DatabaseConnection.reconnectAttempts++;

    console.log(`🔄 [DB] Reconectando em ${delay}ms (tentativa ${DatabaseConnection.reconnectAttempts}/${DatabaseConnection.maxReconnectAttempts})`);

    setTimeout(() => {
      this.initialize();
    }, delay);
  }

  /**
   * Status da conexão
   */
  getStatus() {
    return {
      isConnected: DatabaseConnection.isConnected,
      lastHealthCheck: DatabaseConnection.lastHealthCheck,
      reconnectAttempts: DatabaseConnection.reconnectAttempts,
      maxReconnectAttempts: DatabaseConnection.maxReconnectAttempts,
    };
  }

  /**
   * Forçar reconexão (usado após deploy)
   */
  async forceReconnect() {
    console.log('🔄 [DB] Forçando reconexão...');

    // Desconectar
    const pool = DatabasePool.getInstance();
    pool.disconnect();

    DatabaseConnection.isConnected = false;
    DatabaseConnection.reconnectAttempts = 0;

    // Aguardar 500ms antes de reconectar
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reconectar
    return this.initialize();
  }

  /**
   * Notificar falha de conexão (pode disparar alerta visual)
   */
  notifyConnectionFailure() {
    const event = new CustomEvent('dbConnectionFailed', {
      detail: {
        message: 'Conexão com banco de dados perdida. Alguns dados podem não estar disponíveis.',
        timestamp: new Date(),
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Limpar resources
   */
  destroy() {
    if (DatabaseConnection.healthCheckInterval) {
      clearInterval(DatabaseConnection.healthCheckInterval);
    }

    const pool = DatabasePool.getInstance();
    pool.disconnect();

    DatabaseConnection.isConnected = false;
    console.log('🔌 [DB] Conexão encerrada');
  }
}

export default DatabaseConnection;
