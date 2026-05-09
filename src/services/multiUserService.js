/**
 * 👥 MultiUserService - Gerencia múltiplos usuários simultâneos
 * Cada usuário tem sua própria sessão, dados isolados e permissões
 */

import DatabasePool from './databasePool.js';
import SyncService from './syncService.js';
import backendApi from './apiBackendService.js';
import AuditLogService from './auditLogService.js';

class MultiUserService {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new MultiUserService();
    }
    return this.instance;
  }

  constructor() {
    this.currentUser = null;
    this.currentTenant = null;
    this.sessions = new Map();
    this.permissions = new Map();
    this.listeners = new Map();

    this.loadSession();
  }

  /**
   * 👤 Registrar novo usuário
   */
  async register(login, email, name, password, tenantId) {
    console.log('📝 Registrando novo usuário:', login);

    try {
      const response = await backendApi.register(login, email, name, password, tenantId);

      if (response.ok) {
        console.log('✅ Usuário registrado:', login);
        return response;
      }

      throw new Error(response.error || 'Erro ao registrar');
    } catch (error) {
      console.error('❌ Erro ao registrar:', error);
      throw error;
    }
  }

  /**
   * 🔐 Login de usuário
   */
  async login(login, password, tenantId) {
    console.log('🔐 Login:', login);

    try {
      const response = await backendApi.login(login, password, tenantId);

      if (response.ok && response.user) {
        // Salvar sessão
        this.currentUser = response.user;
        this.currentTenant = tenantId;

        const session = {
          userId: response.user.id,
          login: response.user.login,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          tenantId: tenantId,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };

        this.sessions.set(response.user.id, session);
        localStorage.setItem('metalflow_session', JSON.stringify(session));

        // Carregar permissões do usuário
        await this.loadUserPermissions(response.user.id);

        // Registrar no audit log
        const auditLog = AuditLogService.getInstance();
        auditLog.log('login', 'user', response.user.id, { login });

        // Iniciar sincronização para este usuário
        const syncService = SyncService.getInstance();
        await syncService.syncNow();

        console.log('✅ Login bem-sucedido:', login);
        this.emit('userLoggedIn', this.currentUser);

        return response;
      }

      throw new Error(response.error || 'Login falhou');
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * 🚪 Logout de usuário
   */
  async logout() {
    if (!this.currentUser) return;

    console.log('🚪 Logout:', this.currentUser.login);

    try {
      const userId = this.currentUser.id;
      const userLogin = this.currentUser.login;

      // Registrar no audit log (antes de limpar)
      const auditLog = AuditLogService.getInstance();
      auditLog.log('logout', 'user', userId, { login: userLogin });

      // Chamar logout no backend
      await backendApi.logout();

      // Limpar sessão local
      this.sessions.delete(userId);
      this.permissions.delete(userId);

      localStorage.removeItem('metalflow_session');
      localStorage.removeItem('metalflow_lastSync');

      this.currentUser = null;
      this.currentTenant = null;

      console.log('✅ Logout bem-sucedido');
      this.emit('userLoggedOut');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * 📊 Carregar permissões do usuário
   */
  async loadUserPermissions(userId) {
    const permissions = {
      userId,
      canCreate: ['clients', 'quotations', 'materials'],
      canRead: ['clients', 'quotations', 'materials', 'reports'],
      canUpdate: ['clients', 'quotations', 'materials'],
      canDelete: [],
      isAdmin: this.currentUser?.role === 'admin',
    };

    // Se for admin, tem todas as permissões
    if (permissions.isAdmin) {
      permissions.canCreate = ['clients', 'quotations', 'materials', 'users'];
      permissions.canUpdate = ['clients', 'quotations', 'materials', 'users'];
      permissions.canDelete = ['clients', 'quotations', 'materials'];
    }

    this.permissions.set(userId, permissions);
    return permissions;
  }

  /**
   * ✅ Verificar permissão
   */
  hasPermission(action, resource) {
    if (!this.currentUser) {
      console.warn('⚠️ Usuário não autenticado');
      return false;
    }

    const perms = this.permissions.get(this.currentUser.id);
    if (!perms) return false;

    const actionMap = {
      create: 'canCreate',
      read: 'canRead',
      update: 'canUpdate',
      delete: 'canDelete',
    };

    const permKey = actionMap[action];
    if (!permKey) return false;

    return perms[permKey].includes(resource);
  }

  /**
   * 📝 Atualizar atividade do usuário
   */
  updateActivity() {
    if (!this.currentUser) return;

    const session = this.sessions.get(this.currentUser.id);
    if (session) {
      session.lastActivity = new Date().toISOString();
    }
  }

  /**
   * 👥 Obter usuário atual
   */
  getCurrentUser() {
    this.updateActivity();
    return this.currentUser;
  }

  /**
   * 🏢 Obter tenant atual
   */
  getCurrentTenant() {
    return this.currentTenant;
  }

  /**
   * 📋 Listar sessões ativas
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      ...session,
      isCurrentUser: session.userId === this.currentUser?.id,
    }));
  }

  /**
   * 💾 Salvar sessão
   */
  loadSession() {
    const saved = localStorage.getItem('metalflow_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.currentTenant = this.currentUser?.tenantId;
        this.sessions.set(this.currentUser.id, JSON.parse(saved));
      } catch (error) {
        console.error('❌ Erro ao carregar sessão:', error);
        localStorage.removeItem('metalflow_session');
      }
    }
  }

  /**
   * 🎧 Adicionar listener
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
   * 📊 Obter estatísticas de sessão
   */
  getSessionStats() {
    return {
      activeSessions: this.sessions.size,
      currentUser: this.currentUser?.login || 'nenhum',
      currentTenant: this.currentTenant,
      sessionDuration: this.currentUser ? Math.round(
        (new Date() - new Date(this.currentUser.loginTime)) / 1000 / 60
      ) + ' minutos' : 'N/A',
    };
  }

  /**
   * ✅ Verificar autenticação
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * 📝 Rastrear mudança de dados (para audit + sync)
   */
  trackChange(resource, data, action = 'update') {
    if (!this.currentUser) return;

    const auditLog = AuditLogService.getInstance();
    auditLog.log(action, resource, data.id, {
      changedAt: new Date().toISOString(),
      userId: this.currentUser.id,
    });

    // Também rastrear na SyncService
    const syncService = SyncService.getInstance();
    syncService.trackChange(resource, data);
  }
}

export default MultiUserService;
