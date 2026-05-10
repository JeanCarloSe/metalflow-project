/**
 * d1Service — todas as operações de dados via API D1 (Cloudflare)
 * Substitui o storageService (IndexedDB local) para clientes, orçamentos e materiais.
 */

const BASE = '/api';

async function request(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Clientes ──────────────────────────────────────────────────────────────────
export const getClients    = () => request('/clients');
export const addClient     = (c) => request('/clients', 'POST', c);
export const updateClient  = (c) => request(`/clients/${c.id}`, 'PUT', c);
export const deleteClient  = (id) => request(`/clients/${id}`, 'DELETE');

// ── Orçamentos ────────────────────────────────────────────────────────────────
export const getQuotations   = () => request('/quotations');
export const addQuotation    = (q) => request('/quotations', 'POST', q);
export const updateQuotation = (q) => request(`/quotations/${q.id}`, 'PUT', q);
export const deleteQuotation = (id) => request(`/quotations/${id}`, 'DELETE');

// ── Materiais ─────────────────────────────────────────────────────────────────
export const getMaterials    = () => request('/materials');
export const addMaterial     = (m) => request('/materials', 'POST', m);
export const updateMaterial  = (m) => request(`/materials/${m.id}`, 'PUT', m);
export const deleteMaterial  = (id) => request(`/materials/${id}`, 'DELETE');

// cleanDuplicateQuotations — sem-op no D1 (banco já é fonte única da verdade)
export const cleanDuplicateQuotations = () => Promise.resolve();
