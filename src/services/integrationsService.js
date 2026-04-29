/**
 * Integrations Service - SEGURO
 * ✅ API keys NUNCA armazenadas no frontend
 * ✅ Chaves criptografadas e guardadas no backend
 * ✅ Frontend apenas armazena status (connected: true/false)
 */

import { backendApi } from './apiBackendService';

const INTEGRATIONS_STATUS_KEY = 'metalflow_integrations_status';

export const INTEGRATION_TYPES = {
  HUBSPOT: 'hubspot',
  SENDGRID: 'sendgrid',
  DOCUSIGN: 'docusign',
  SLACK: 'slack',
  GOOGLE_DRIVE: 'google_drive',
};

// ==================== STATUS APENAS (sem API keys!) ====================

export function getIntegrationStatus() {
  const stored = localStorage.getItem(INTEGRATIONS_STATUS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function setIntegrationConnected(type) {
  const status = getIntegrationStatus();
  status[type] = {
    connected: true,
    connectedAt: new Date().toISOString(),
  };
  localStorage.setItem(INTEGRATIONS_STATUS_KEY, JSON.stringify(status));
}

export function removeIntegrationStatus(type) {
  const status = getIntegrationStatus();
  delete status[type];
  localStorage.setItem(INTEGRATIONS_STATUS_KEY, JSON.stringify(status));
}

export function isIntegrationEnabled(type) {
  const status = getIntegrationStatus();
  return status[type]?.connected || false;
}

// ==================== BACKEND SECURE INTEGRATIONS ====================

/**
 * Conectar integração (chave criptografada no backend)
 */
export async function connectIntegration(tenantId, type, config) {
  try {
    const response = await backendApi.post(`/integrations/${tenantId}/connect/${type}`, config);
    if (response.success) {
      setIntegrationConnected(type);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`${type} connection failed:`, error);
    return false;
  }
}

/**
 * Desconectar integração
 */
export async function disconnectIntegration(tenantId, type) {
  try {
    await backendApi.request(`/integrations/${tenantId}/${type}`, 'DELETE');
    removeIntegrationStatus(type);
    return true;
  } catch (error) {
    console.error(`${type} disconnection failed:`, error);
    return false;
  }
}

/**
 * Buscar status de integrations (não retorna API keys!)
 */
export async function fetchIntegrationStatus(tenantId) {
  try {
    const response = await backendApi.get(`/integrations/${tenantId}/status`);
    return response;
  } catch (error) {
    console.error('Failed to fetch integration status:', error);
    return {};
  }
}

// ==================== BACKEND OPERATIONS ====================

/**
 * SendGrid: enviar email com PDF (backend faz tudo)
 */
export async function sendQuotationEmail(tenantId, quotationId, recipientEmail) {
  try {
    const response = await backendApi.post(
      `/quotations/${tenantId}/${quotationId}/send-email`,
      { recipientEmail }
    );
    return response;
  } catch (error) {
    console.error('Failed to send quotation email:', error);
    throw error;
  }
}

/**
 * HubSpot: sincronizar cliente (backend faz tudo)
 */
export async function syncClientToHubSpot(tenantId, clientId) {
  try {
    const response = await backendApi.post(
      `/integrations/${tenantId}/sync-hubspot`,
      { clientId }
    );
    return response;
  } catch (error) {
    console.error('HubSpot sync failed:', error);
    return null;
  }
}

/**
 * Slack: notificar atualização (backend faz tudo)
 */
export async function sendSlackQuotationUpdate(tenantId, quotationId, status) {
  try {
    await backendApi.post(
      `/integrations/${tenantId}/slack-notify`,
      { quotationId, status }
    );
  } catch (error) {
    console.error('Slack notification failed:', error);
  }
}

// ==================== COMPATIBILIDADE (Deprecated) ====================

// Funções antigas que foram migradas para backend
export async function connectHubSpot(apiKey) {
  console.warn('connectHubSpot deprecated, use backend');
  return false;
}

export async function connectSendGrid(apiKey) {
  console.warn('connectSendGrid deprecated, use backend');
  return false;
}

export async function connectSlack(webhookUrl) {
  console.warn('connectSlack deprecated, use backend');
  return false;
}

export function removeIntegration(type) {
  console.warn('removeIntegration deprecated, use backend');
}
