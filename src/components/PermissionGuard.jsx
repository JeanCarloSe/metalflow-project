import React, { useState, useEffect } from 'react';
import MultiUserService from '../services/multiUserService';

/**
 * PermissionGuard - Renderiza conteúdo apenas se usuário tiver permissão
 * @param {string} action - 'create', 'read', 'update', 'delete'
 * @param {string} resource - 'clients', 'quotations', 'materials', 'users'
 * @param {React.ReactNode} children - Conteúdo a renderizar
 * @param {React.ReactNode} fallback - O que mostrar se não tiver permissão (opcional)
 */
const PermissionGuard = ({ action, resource, children, fallback = null }) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const multiUserService = MultiUserService.getInstance();
    const permission = multiUserService.hasPermission(action, resource);
    setHasPermission(permission);
  }, [action, resource]);

  if (!hasPermission) {
    return fallback ? (
      fallback
    ) : (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ❌ Você não tem permissão para {action === 'create' ? 'criar' : action === 'read' ? 'visualizar' : action === 'update' ? 'atualizar' : 'deletar'} {resource}
        </p>
      </div>
    );
  }

  return children;
};

export default PermissionGuard;
