import DatabasePool from './databasePool.js';

const SESSION_KEY = 'metalflow_user';
const TENANT_KEY = 'metalflow_tenant';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:3000/api';

/**
 * Login: tenta backend primeiro, fallback para local
 */
export const loginUser = async (login, password, tenantId) => {
  const loginLower = login.trim().toLowerCase();

  // Tentar backend
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: loginLower,
        password,
        tenantId: tenantId || localStorage.getItem(TENANT_KEY) || 'default'
      })
    });

    if (response.ok) {
      const { user } = await response.json();
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      localStorage.setItem(TENANT_KEY, user.tenantId);
      return { ok: true, user };
    }
  } catch (err) {
    // Continua para login local
  }

  // Fallback: login local via IndexedDB
  try {
    const db = await DatabasePool.getInstance().getDB();

    const users = await new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const user = users.find(u => u.login === loginLower && u.password === password);

    if (!user) {
      return { ok: false, error: 'Usuário ou senha inválidos' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * Buscar sessão do usuário salvo
 */
export const getSession = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Logout seguro
 */
export const clearSession = async () => {
  try {
    // Notificar backend para limpar cookie
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    // Continua mesmo se falhar
  }

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TENANT_KEY);
};

export const setSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

/**
 * Criar usuário local (IndexedDB)
 */
export const createLocalUser = async (login, password, name, number, role = 'operator') => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    const user = {
      id: `user-${Date.now()}`,
      login: login.toLowerCase(),
      password,
      name,
      number,
      role,
      createdAt: new Date().toISOString()
    };

    await new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const req = store.add(user);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });

    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

/**
 * Verificar se há usuários
 */
export const hasAnyUser = async () => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    const users = await new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return users.length > 0;
  } catch {
    return false;
  }
};

/**
 * Obter todos os usuários
 */
export const getAllUsers = async () => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return await new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};

// createUser was a wrapper for createLocalUser - use createLocalUser directly instead
// deleteUser is handled by storageService.deleteUser instead
