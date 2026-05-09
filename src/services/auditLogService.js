/**
 * 📋 AuditLogService - Rastreia todas as ações de usuários
 * Logging de criação, leitura, atualização e deleção de dados
 */

import MultiUserService from './multiUserService.js';

class AuditLogService {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AuditLogService();
    }
    return this.instance;
  }

  constructor() {
    this.logs = [];
    this.listeners = new Map();
    this.loadLogsFromStorage();
  }

  /**
   * 📝 Registrar ação no audit log
   */
  log(action, resource, resourceId, details = {}) {
    const multiUserService = MultiUserService.getInstance();
    const currentUser = multiUserService.getCurrentUser();

    if (!currentUser) {
      console.warn('⚠️ Tentando registrar ação sem usuário autenticado');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userLogin: currentUser.login,
      userName: currentUser.name,
      action,
      resource,
      resourceId,
      details,
      tenantId: multiUserService.getCurrentTenant(),
    };

    this.logs.push(entry);
    console.log(`📋 Audit: ${currentUser.login} - ${action} ${resource} (${resourceId})`);

    // Salvar no localStorage (máximo 1000 entradas)
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    this.saveLogsToStorage();

    // Emitir evento
    this.emit('auditLog', entry);
  }

  /**
   * 🔍 Obter logs de um usuário
   */
  getUserLogs(userId) {
    return this.logs.filter(log => log.userId === userId);
  }

  /**
   * 🔍 Obter logs de um recurso
   */
  getResourceLogs(resource, resourceId) {
    return this.logs.filter(
      log => log.resource === resource && log.resourceId === resourceId
    );
  }

  /**
   * 🔍 Obter logs por ação
   */
  getActionLogs(action) {
    return this.logs.filter(log => log.action === action);
  }

  /**
   * 📊 Obter resumo de atividade
   */
  getActivitySummary(sinceTimestamp = null) {
    const filtered = sinceTimestamp
      ? this.logs.filter(log => new Date(log.timestamp) > new Date(sinceTimestamp))
      : this.logs;

    const summary = {
      totalActions: filtered.length,
      byAction: {},
      byResource: {},
      byUser: {},
    };

    filtered.forEach(log => {
      // Contar por ação
      summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;

      // Contar por recurso
      summary.byResource[log.resource] = (summary.byResource[log.resource] || 0) + 1;

      // Contar por usuário
      if (!summary.byUser[log.userId]) {
        summary.byUser[log.userId] = {
          name: log.userName,
          login: log.userLogin,
          count: 0,
        };
      }
      summary.byUser[log.userId].count += 1;
    });

    return summary;
  }

  /**
   * 🗑️ Limpar logs antigos
   */
  clearOldLogs(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const beforeCount = this.logs.length;
    this.logs = this.logs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );
    const removedCount = beforeCount - this.logs.length;

    console.log(`🗑️ Removidos ${removedCount} logs com mais de ${daysOld} dias`);
    this.saveLogsToStorage();

    return removedCount;
  }

  /**
   * 💾 Salvar logs no localStorage
   */
  saveLogsToStorage() {
    try {
      localStorage.setItem('metalflow_auditlogs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('❌ Erro ao salvar logs:', error);
    }
  }

  /**
   * 📂 Carregar logs do localStorage
   */
  loadLogsFromStorage() {
    try {
      const saved = localStorage.getItem('metalflow_auditlogs');
      if (saved) {
        this.logs = JSON.parse(saved);
        console.log(`✅ Carregados ${this.logs.length} logs de auditoria`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar logs:', error);
      this.logs = [];
    }
  }

  /**
   * 🎧 Adicionar listener para logs
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 🔔 Emitir evento
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener de ${event}:`, error);
        }
      });
    }
  }

  /**
   * 📊 Obter todos os logs
   */
  getAllLogs() {
    return [...this.logs];
  }

  /**
   * 📋 Exportar logs como JSON
   */
  exportLogsAsJSON() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export default AuditLogService;
