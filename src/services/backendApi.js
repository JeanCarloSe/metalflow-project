/**
 * Backend API - Simples
 * Tenta login via backend, fallback para local
 */

const API_URL = 'http://localhost:3000/api';

export async function loginViaBackend(login, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
      timeout: 5000, // 5 segundos
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login backend sucesso');

      // Salvar token para futuro
      localStorage.setItem('backend_token', data.access_token);

      return {
        success: true,
        user: data.user,
      };
    } else {
      console.warn('⚠️ Backend retornou erro:', response.status);
      return { success: false };
    }
  } catch (error) {
    console.warn('⚠️ Backend indisponível:', error.message);
    return { success: false };
  }
}

export async function registerViaBackend(login, email, name, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, email, name, password }),
      timeout: 5000,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Register backend sucesso');
      localStorage.setItem('backend_token', data.access_token);
      return { success: true, user: data.user };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.warn('⚠️ Backend indisponível:', error.message);
    return { success: false };
  }
}

export function isBackendAvailable() {
  return localStorage.getItem('backend_token') !== null;
}

export function clearBackendToken() {
  localStorage.removeItem('backend_token');
}
