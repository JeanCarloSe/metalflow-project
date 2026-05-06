/**
 * 📱 Demo Backend Service - Fallback quando backend real não está disponível
 * Simula respostas da API para desenvolvimento/testes offline
 */

class DemoBackendService {
  isAuthenticated() {
    return true;
  }

  isOnline() {
    return navigator.onLine;
  }

  async getSyncSnapshot() {
    console.log('📱 [DEMO] Retornando snapshot de demonstração');

    return {
      ok: true,
      snapshot: {
        timestamp: new Date().toISOString(),
        clients: [
          { id: '1', tenant_id: 'demo', name: 'Cliente Demo', email: 'demo@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', tenant_id: 'demo', name: 'Empresa XYZ', email: 'xyz@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
        materials: [
          { id: 'aço', tenant_id: 'demo', name: 'Aço Carbono', density: 7850, cost_price: 3.50, sell_price: 4.25, base_price: 4.25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'inox', tenant_id: 'demo', name: 'Inox 304', density: 8000, cost_price: 4.10, sell_price: 5.30, base_price: 5.30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'alu', tenant_id: 'demo', name: 'Alumínio 1050', density: 2700, cost_price: 4.50, sell_price: 6.00, base_price: 6.00, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
        quotations: [],
        lines: [],
      },
    };
  }

  async getSyncDelta(since) {
    console.log('📱 [DEMO] Retornando delta de demonstração');

    return {
      ok: true,
      delta: {
        timestamp: new Date().toISOString(),
        since: since,
        clients: [],
        materials: [],
        quotations: [],
        lines: [],
        deletions: [],
      },
    };
  }

  async importSyncChanges(changes) {
    console.log('📱 [DEMO] Importando mudanças (simulado)', changes);

    return {
      ok: true,
      results: {
        imported: Object.values(changes).flat().length,
        conflicts: 0,
        errors: 0,
      },
      message: 'Modo demo - mudanças salvas localmente apenas',
    };
  }

  async register(login, email, name, password, tenantId) {
    console.log('📱 [DEMO] Registrando usuário (simulado)', { login, email, name });

    return {
      ok: true,
      user: { id: 'demo-user', login, email, name, role: 'user' },
    };
  }

  async login(login, password, tenantId) {
    console.log('📱 [DEMO] Login (simulado)', { login });

    return {
      ok: true,
      user: { id: 'demo-user', login, email: 'demo@example.com', name: 'Demo User', role: 'user' },
    };
  }

  async logout() {
    console.log('📱 [DEMO] Logout (simulado)');
    return { ok: true };
  }

  async getClients(skip = 0, take = 10) {
    console.log('📱 [DEMO] Listando clientes (simulado)');
    return {
      ok: true,
      data: [
        { id: '1', name: 'Cliente Demo', email: 'demo@example.com' },
        { id: '2', name: 'Empresa XYZ', email: 'xyz@example.com' },
      ],
      total: 2,
    };
  }

  async getClient(id) {
    return {
      ok: true,
      data: { id, name: 'Cliente Demo', email: 'demo@example.com' },
    };
  }

  async createClient(data) {
    return {
      ok: true,
      data: { id: Date.now().toString(), ...data },
    };
  }

  async updateClient(id, data) {
    return {
      ok: true,
      data: { id, ...data },
    };
  }

  async deleteClient(id) {
    return { ok: true };
  }

  async getQuotations(skip = 0, take = 10) {
    return {
      ok: true,
      data: [],
      total: 0,
    };
  }

  async createQuotation(data) {
    return {
      ok: true,
      data: { id: Date.now().toString(), ...data },
    };
  }

  async updateQuotation(id, data) {
    return {
      ok: true,
      data: { id, ...data },
    };
  }

  async getMaterials(skip = 0, take = 10) {
    return {
      ok: true,
      data: [
        { id: 'aço', name: 'Aço Carbono', density: 7850, cost_price: 3.50, sell_price: 4.25 },
        { id: 'inox', name: 'Inox 304', density: 8000, cost_price: 4.10, sell_price: 5.30 },
        { id: 'alu', name: 'Alumínio 1050', density: 2700, cost_price: 4.50, sell_price: 6.00 },
      ],
      total: 3,
    };
  }

  async createMaterial(data) {
    return {
      ok: true,
      data: { id: Date.now().toString(), ...data },
    };
  }

  async updateMaterial(id, data) {
    return {
      ok: true,
      data: { id, ...data },
    };
  }
}

const demoBackendService = new DemoBackendService();

export default demoBackendService;
export { demoBackendService };
