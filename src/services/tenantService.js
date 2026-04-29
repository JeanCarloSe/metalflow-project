/**
 * Tenant Service
 * Gerencia múltiplos tenants (empresas/organizações)
 */

const TENANTS_DB = 'metalflow_tenants';
const CURRENT_TENANT_KEY = 'metalflow_current_tenant';

export async function initTenantsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TENANTS_DB, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tenants')) {
        const store = db.createObjectStore('tenants', { keyPath: 'id' });
        store.createIndex('slug', 'slug', { unique: true });
        store.createIndex('email', 'email', { unique: false });
      }
    };
  });
}

export async function createTenant(data) {
  const db = await initTenantsDB();
  const tenant = {
    id: Date.now().toString(),
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    website: data.website || '',
    logoUrl: data.logoUrl || '',
    primaryColor: data.primaryColor || '#0170B9',
    tagline: data.tagline || '',
    createdAt: new Date().toISOString(),
    settings: {
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      ...data.settings,
    },
  };

  return new Promise((resolve, reject) => {
    const request = db.transaction(['tenants'], 'readwrite').objectStore('tenants').add(tenant);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(tenant);
  });
}

export async function getTenants() {
  const db = await initTenantsDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(['tenants'], 'readonly').objectStore('tenants').getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getTenant(id) {
  const db = await initTenantsDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(['tenants'], 'readonly').objectStore('tenants').get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getTenantBySlug(slug) {
  const db = await initTenantsDB();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(['tenants'], 'readonly')
      .objectStore('tenants')
      .index('slug')
      .get(slug);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function updateTenant(id, updates) {
  const db = await initTenantsDB();
  const tenant = await getTenant(id);
  const updated = { ...tenant, ...updates, updatedAt: new Date().toISOString() };

  return new Promise((resolve, reject) => {
    const request = db.transaction(['tenants'], 'readwrite').objectStore('tenants').put(updated);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(updated);
  });
}

export async function deleteTenant(id) {
  const db = await initTenantsDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(['tenants'], 'readwrite').objectStore('tenants').delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export function setCurrentTenant(tenantId) {
  localStorage.setItem(CURRENT_TENANT_KEY, tenantId);
}

export function getCurrentTenant() {
  return localStorage.getItem(CURRENT_TENANT_KEY);
}

export function clearCurrentTenant() {
  localStorage.removeItem(CURRENT_TENANT_KEY);
}

export async function switchTenant(tenantId) {
  const tenant = await getTenant(tenantId);
  if (!tenant) throw new Error('Tenant não encontrado');
  setCurrentTenant(tenantId);
  return tenant;
}

export function getTenantFromURL() {
  const path = window.location.pathname;
  const match = path.match(/^\/([a-z0-9-]+)\//);
  return match ? match[1] : null;
}

export function buildTenantURL(slug, path = '/') {
  return `/${slug}${path}`;
}

export async function validateTenantSlug(slug) {
  const tenant = await getTenantBySlug(slug);
  return !tenant;
}

export async function generateTenantStats(tenantId, quotations, clients) {
  const tenantQuotations = quotations.filter(q => q.tenantId === tenantId || !q.tenantId);
  const tenantClients = clients.filter(c => c.tenantId === tenantId || !c.tenantId);

  return {
    totalQuotations: tenantQuotations.length,
    totalValue: tenantQuotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0),
    totalClients: tenantClients.length,
    approvedRate: tenantQuotations.length > 0
      ? (tenantQuotations.filter(q => q.status === 'aprovado').length / tenantQuotations.length * 100).toFixed(1)
      : 0,
  };
}
