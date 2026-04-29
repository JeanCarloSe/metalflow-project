import { useState, useCallback } from 'react';
import {
  connectHubSpot,
  connectSendGrid,
  connectSlack,
  removeIntegration,
} from '../services/integrationsService';

export const useIntegration = (onNotify) => {
  const [connecting, setConnecting] = useState({});

  const connect = useCallback(async (type, credential) => {
    if (!credential?.trim()) {
      onNotify('error', `${type}: Credencial obrigatória`);
      return false;
    }

    setConnecting(prev => ({ ...prev, [type]: true }));

    try {
      let result = false;
      switch (type) {
        case 'hubspot':
          result = await connectHubSpot(credential);
          break;
        case 'sendgrid':
          result = await connectSendGrid(credential);
          break;
        case 'slack':
          result = await connectSlack(credential);
          break;
        default:
          break;
      }

      if (result) {
        onNotify('success', `${type.charAt(0).toUpperCase() + type.slice(1)} conectado!`);
        return true;
      } else {
        onNotify('error', `Falha ao conectar ${type}. Verifique a credencial.`);
        return false;
      }
    } catch (error) {
      onNotify('error', `Erro: ${error.message}`);
      return false;
    } finally {
      setConnecting(prev => ({ ...prev, [type]: false }));
    }
  }, [onNotify]);

  const disconnect = useCallback((type) => {
    try {
      removeIntegration(type);
      onNotify('success', `${type.charAt(0).toUpperCase() + type.slice(1)} desconectado`);
      return true;
    } catch (error) {
      onNotify('error', `Erro ao desconectar: ${error.message}`);
      return false;
    }
  }, [onNotify]);

  return { connecting, connect, disconnect };
};
