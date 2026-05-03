const SESSION_KEY = 'metalflow_user';
const TENANT_KEY = 'metalflow_tenant';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:3000/api';

/**
 * Login via backend seguro (HttpOnly cookies)
 * Token nunca vem no JSON, apenas em cookie
 */
export const loginUser = async (login, password, tenantId) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // ✅ Envia/recebe HttpOnly cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: login.trim().toLowerCase(),
        password,
        tenantId: tenantId || localStorage.getItem(TENANT_KEY) || 'default'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Login failed' };
    }

    const { user } = await response.json();

    // Armazenar dados do usuário (NÃO token!)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(TENANT_KEY, user.tenantId);

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
 * Compatibilidade: localUser para fallback offline
 */
export const createLocalUser = async (login, password, name, number, role = 'operator') => {
  // ❌ Deprecated: usar backend
  console.warn('createLocalUser deprecated, use backend /auth/register');
  return { ok: false, error: 'Use backend for registration' };
};

/**
 * Compatibilidade: não mais necessário
 */
export const hasAnyUser = async () => {
  const user = getSession();
  return !!user;
};

// Fallback: apenas para compatibilidade com código antigo
export const getAllUsers = async () => {
  const user = getSession();
  return user ? [user] : [];
};

// Compatibilidade: funções deprecated (usam fallback local)
export const createUser = async (login, password, name, number, role) => {
  console.warn('createUser deprecated, use backend');
  return { ok: false, error: 'Use backend registration' };
};

export const deleteUser = async (userId) => {
  console.warn('deleteUser deprecated, use backend');
  return { ok: false, error: 'Use backend' };
};
