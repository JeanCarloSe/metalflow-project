/**
 * 🔒 DataAccessService - Controla acesso aos dados baseado em role do usuário
 * Operadores veem apenas seus dados
 * Admins veem todos os dados
 */

class DataAccessService {
  /**
   * Filtrar orçamentos baseado na role do usuário
   */
  static filterQuotations(quotations, currentUser) {
    if (!currentUser) return [];

    // Admins veem todos os orçamentos
    if (currentUser.role === 'admin') {
      return quotations;
    }

    // Operadores veem apenas os seus
    return quotations.filter(q => {
      // Verificar se o operador é o criador do orçamento
      if (q.operator?.id === currentUser.id) return true;
      if (q.operatorId === currentUser.id) return true;
      if (q.createdBy === currentUser.id) return true;

      // Fallback: se o operator está salvo como string ou objeto
      if (typeof q.operator === 'string' && q.operator === currentUser.id) return true;
      if (typeof q.operator === 'object' && q.operator?.id === currentUser.id) return true;

      return false;
    });
  }

  /**
   * Clientes são compartilhados entre todos os usuários
   */
  static filterClients(clients, quotations, currentUser) {
    if (!currentUser) return [];
    return clients;

    // Código abaixo mantido para referência (não executado)
    const accessibleQuotations = this.filterQuotations(quotations, currentUser);
    const clientIds = new Set(
      accessibleQuotations
        .map(q => q.clientId)
        .filter(Boolean)
    );

    return clients.filter(c => clientIds.has(c.id));
  }

  /**
   * Verificar se operador tem acesso a um orçamento específico
   */
  static canAccessQuotation(quotation, currentUser) {
    if (!currentUser) return false;

    // Admins podem acessar tudo
    if (currentUser.role === 'admin') return true;

    // Operadores só podem acessar seus orçamentos
    return quotation.operator?.id === currentUser.id ||
           quotation.operatorId === currentUser.id ||
           quotation.createdBy === currentUser.id ||
           (typeof quotation.operator === 'string' && quotation.operator === currentUser.id) ||
           (typeof quotation.operator === 'object' && quotation.operator?.id === currentUser.id);
  }

  /**
   * Verificar se operador tem acesso a um cliente
   */
  static canAccessClient(client, quotations, currentUser) {
    if (!currentUser) return false;

    // Admins podem acessar tudo
    if (currentUser.role === 'admin') return true;

    // Operadores só podem acessar clientes com seus orçamentos
    const operatorQuotations = quotations.filter(q =>
      (q.operator?.id === currentUser.id ||
       q.operatorId === currentUser.id ||
       q.createdBy === currentUser.id)
    );

    return operatorQuotations.some(q => q.clientId === client.id);
  }
}

export default DataAccessService;
