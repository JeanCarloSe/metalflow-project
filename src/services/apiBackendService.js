/**
 * Backend API Service - Seguro com HttpOnly Cookies
 *
 * ✅ Token em HttpOnly cookie (não em localStorage)
 * ✅ Chaves API criptografadas no backend
 * ✅ Multi-tenant isolado
 */

const API_URL = process.env.REACT_APP_BACKEND_API || 'http://localhost:3000/api';

class BackendAPIService {
  constructor() {
    this.lastSync = localStorage.getItem('quoteos_lastSync') || null;
  }

  isAuthenticated() {
    // Verificar se há sessão armazenada (não token!)
    const user = localStorage.getItem('metalflow_user');
    return !!user;
  }

  isOnline() {
    return navigator.onLine;
  }

  // ============ AUTH (via backend seguro) ============

  async register(login, email, name, password, tenantId) {
    return this.request('/auth/register', 'POST', {
      login,
      email,
      name,
      password,
      tenantId
    });
  }

  async login(login, password, tenantId) {
    // Token vem em HttpOnly cookie, não aqui!
    return this.request('/auth/login', 'POST', {
      login,
      password,
      tenantId
    });
  }

  async logout() {
    await this.request('/auth/logout', 'POST');
  }

  // ============ QUOTATIONS ============

  async getQuotations(skip = 0, take = 10) {
    return this.request(`/quotations?skip=${skip}&take=${take}`, 'GET');
  }

  async getQuotation(id) {
    return this.request(`/quotations/${id}`, 'GET');
  }

  async createQuotation(data) {
    return this.request('/quotations', 'POST', data);
  }

  async updateQuotation(id, data) {
    return this.request(`/quotations/${id}`, 'PUT', data);
  }

  async changeQuotationStatus(id, status) {
    return this.request(`/quotations/${id}/status`, 'PUT', { status });
  }

  async getQuotationVersions(id) {
    return this.request(`/quotations/${id}/versions`, 'GET');
  }

  async getQuotationAuditLog(id) {
    return this.request(`/quotations/${id}/audit-log`, 'GET');
  }

  // ============ CLIENTS ============

  async getClients(skip = 0, take = 10) {
    return this.request(`/clients?skip=${skip}&take=${take}`, 'GET');
  }

  async getClient(id) {
    return this.request(`/clients/${id}`, 'GET');
  }

  async createClient(data) {
    return this.request('/clients', 'POST', data);
  }

  async updateClient(id, data) {
    return this.request(`/clients/${id}`, 'PUT', data);
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, 'DELETE');
  }

  // ============ WORKFLOW ============

  async getWorkflowStatuses() {
    return this.request('/workflow/statuses', 'GET');
  }

  async getWorkflowTransitions(status) {
    return this.request(`/workflow/transitions/${status}`, 'GET');
  }

  // ============ SYNC ============

  async getSyncSnapshot() {
    return this.request('/sync/snapshot', 'GET');
  }

  async importSyncChanges(changes) {
    return this.request('/sync/import', 'POST', changes);
  }

  async getSyncDelta(since) {
    if (!since) {
      throw new Error('since parameter required (ISO timestamp)');
    }
    return this.request(`/sync/delta?since=${encodeURIComponent(since)}`, 'GET');
  }

  // ============ HELPER: Requisição com HttpOnly Cookies ============

  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      credentials: 'include', // ✅ HttpOnly cookies (automático!)
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const url = `${API_URL}${endpoint}`;
      console.log(`📡 ${method} ${endpoint}`);

      const response = await fetch(url, options);

      // ✅ 401 = token expirou
      if (response.status === 401) {
        console.warn('Session expired, redirecting to login');
        localStorage.removeItem('metalflow_user');
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `API Error ${response.status}: ${error.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }
}

const backendApi = new BackendAPIService();

export default backendApi;
export { backendApi };
