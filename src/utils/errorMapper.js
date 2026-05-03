/**
 * 🐛 Error Mapper - Mapeia, Classifica e Exporta Erros
 * Para análise por Frontend e Backend
 */

export class ErrorMapper {
  static instance = null;

  constructor() {
    this.issues = [];
    this.categories = {
      'AUTHENTICATION': 'Autenticação',
      'DATABASE': 'Banco de Dados',
      'NETWORK': 'Requisição/Rede',
      'PERFORMANCE': 'Performance',
      'UI_RENDERING': 'Renderização UI',
      'VALIDATION': 'Validação',
      'BUSINESS_LOGIC': 'Lógica de Negócio',
      'THIRD_PARTY': 'Serviço Terceiro',
      'UNKNOWN': 'Desconhecido'
    };

    this.severities = {
      'CRITICAL': 'Crítico - Bloqueia uso',
      'HIGH': 'Alto - Afeta funcionalidade',
      'MEDIUM': 'Médio - Causa inconveniente',
      'LOW': 'Baixo - Cosmético/Minor'
    };

    this.components = {
      'CLIENT_FORM': 'Formulário de Clientes',
      'QUOTATION_BUILDER': 'Construtor de Orçamentos',
      'PDF_GENERATOR': 'Gerador de PDF',
      'ADMIN_PANEL': 'Painel Admin',
      'DATABASE_LAYER': 'Camada DB',
      'API_INTEGRATION': 'Integração API',
      'NAVIGATION': 'Navegação',
      'DASHBOARD': 'Dashboard',
      'UNKNOWN': 'Desconhecido'
    };

    this.init();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ErrorMapper();
    }
    return this.instance;
  }

  init() {
    try {
      this.captureErrors();
      console.log('✅ Error Mapper iniciado');
      console.log('📍 Acessível em window.errorMapper');
    } catch (error) {
      console.error('❌ Erro ao inicializar Error Mapper:', error);
    }
  }

  captureErrors() {
    const origError = console.error;
    const origWarn = console.warn;

    console.error = (...args) => {
      origError.apply(console, args);
      this.mapError(args.join(' '), 'error');
    };

    console.warn = (...args) => {
      origWarn.apply(console, args);
      this.mapError(args.join(' '), 'warning');
    };

    window.addEventListener('error', (event) => {
      this.mapError(
        `${event.message} (${event.filename}:${event.lineno})`,
        'error',
        event.error?.stack
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.mapError(
        `Promise rejection: ${event.reason}`,
        'error',
        event.reason?.stack
      );
    });
  }

  mapError(message, type = 'error', stack = '') {
    const issue = this.classifyError(message, type, stack);

    // Verificar se já existe (evitar duplicatas)
    if (!this.issues.find(i => i.id === issue.id)) {
      this.issues.push(issue);

      // Manter histórico limitado
      if (this.issues.length > 500) {
        this.issues.shift();
      }

      console.log(`🐛 [${issue.severity}] ${issue.category}: ${issue.title}`);
    }
  }

  classifyError(message, type, stack) {
    const timestamp = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let category = 'UNKNOWN';
    let severity = type === 'error' ? 'HIGH' : 'LOW';
    let component = 'UNKNOWN';
    let suggestion = '';

    // Classificar por tipo de erro
    if (message.includes('JSON.parse') || message.includes('JSON')) {
      category = 'VALIDATION';
      severity = 'MEDIUM';
      suggestion = 'Verificar formato de dados JSON';
    } else if (message.includes('IndexedDB') || message.includes('transaction')) {
      category = 'DATABASE';
      severity = 'CRITICAL';
      suggestion = 'Problema ao acessar banco de dados';
    } else if (message.includes('fetch') || message.includes('XHR') || message.includes('404') || message.includes('500')) {
      category = 'NETWORK';
      severity = 'HIGH';
      component = 'API_INTEGRATION';
      suggestion = 'Verificar conexão e endpoint';
    } else if (message.includes('Cannot read') || message.includes('undefined')) {
      category = 'UI_RENDERING';
      severity = 'HIGH';
      suggestion = 'Verificar renderização de componente';
    } else if (message.includes('client') || message.includes('Customer')) {
      category = 'BUSINESS_LOGIC';
      severity = 'MEDIUM';
      component = 'CLIENT_FORM';
    } else if (message.includes('quotation') || message.includes('quote') || message.includes('orçamento')) {
      category = 'BUSINESS_LOGIC';
      severity = 'HIGH';
      component = 'QUOTATION_BUILDER';
      suggestion = 'Verificar lógica de cálculo de orçamento';
    } else if (message.includes('PDF') || message.includes('canvas')) {
      category = 'THIRD_PARTY';
      severity = 'MEDIUM';
      component = 'PDF_GENERATOR';
      suggestion = 'Verificar geração de PDF';
    } else if (message.includes('SLOW') || message.includes('timeout')) {
      category = 'PERFORMANCE';
      severity = 'MEDIUM';
      suggestion = 'Operação muito lenta - otimização necessária';
    } else if (message.includes('auth') || message.includes('login')) {
      category = 'AUTHENTICATION';
      severity = 'CRITICAL';
      suggestion = 'Problema com autenticação';
    } else if (message.includes('memory') || message.includes('Memory')) {
      category = 'PERFORMANCE';
      severity = 'CRITICAL';
      suggestion = 'Possível memory leak';
    }

    return {
      id,
      timestamp,
      message: message.slice(0, 500),
      type,
      category,
      severity,
      component,
      stack: stack.slice(0, 1000),
      suggestion,
      count: 1,
      lastSeen: timestamp,
      resolved: false,
      assignee: null,
      notes: ''
    };
  }

  // Agrupar erros similares
  getGroupedIssues() {
    const grouped = {};

    this.issues.forEach(issue => {
      const key = `${issue.category}-${issue.component}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: issue.category,
          component: issue.component,
          severity: issue.severity,
          count: 0,
          issues: [],
          lastSeen: issue.timestamp
        };
      }
      grouped[key].count++;
      grouped[key].issues.push(issue);
      grouped[key].lastSeen = issue.timestamp;
    });

    return Object.values(grouped).sort((a, b) => {
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // Filtrar por tipo
  getIssuesByCategory(category) {
    return this.issues.filter(i => i.category === category);
  }

  // Filtrar por severidade
  getIssuesBySeverity(severity) {
    return this.issues.filter(i => i.severity === severity);
  }

  // Filtrar por componente
  getIssuesByComponent(component) {
    return this.issues.filter(i => i.component === component);
  }

  // Gerar relatório para Frontend
  getFrontendReport() {
    const frontendComponents = ['CLIENT_FORM', 'QUOTATION_BUILDER', 'DASHBOARD', 'NAVIGATION', 'UI_RENDERING'];
    const issues = this.issues.filter(i => frontendComponents.includes(i.component));

    return {
      title: '🔧 Frontend Issues Report',
      generatedAt: new Date().toISOString(),
      summary: {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'CRITICAL').length,
        high: issues.filter(i => i.severity === 'HIGH').length,
        medium: issues.filter(i => i.severity === 'MEDIUM').length,
        low: issues.filter(i => i.severity === 'LOW').length
      },
      byComponent: this.groupBy(issues, 'component'),
      byCategory: this.groupBy(issues, 'category'),
      issues: issues.sort((a, b) => {
        const order = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return order[a.severity] - order[b.severity];
      })
    };
  }

  // Gerar relatório para Backend
  getBackendReport() {
    const backendComponents = ['DATABASE_LAYER', 'API_INTEGRATION', 'BUSINESS_LOGIC'];
    const issues = this.issues.filter(i =>
      backendComponents.includes(i.component) ||
      i.category === 'DATABASE' ||
      i.category === 'NETWORK'
    );

    return {
      title: '🔧 Backend Issues Report',
      generatedAt: new Date().toISOString(),
      summary: {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'CRITICAL').length,
        high: issues.filter(i => i.severity === 'HIGH').length,
        medium: issues.filter(i => i.severity === 'MEDIUM').length,
        low: issues.filter(i => i.severity === 'LOW').length
      },
      byComponent: this.groupBy(issues, 'component'),
      byCategory: this.groupBy(issues, 'category'),
      issues: issues.sort((a, b) => {
        const order = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return order[a.severity] - order[b.severity];
      })
    };
  }

  // Gerar relatório completo
  getFullReport() {
    return {
      title: '🐛 Complete Issues Report',
      generatedAt: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      summary: {
        total: this.issues.length,
        critical: this.issues.filter(i => i.severity === 'CRITICAL').length,
        high: this.issues.filter(i => i.severity === 'HIGH').length,
        medium: this.issues.filter(i => i.severity === 'MEDIUM').length,
        low: this.issues.filter(i => i.severity === 'LOW').length,
        resolved: this.issues.filter(i => i.resolved).length,
        unresolved: this.issues.filter(i => !i.resolved).length
      },
      byCategory: this.groupBy(this.issues, 'category'),
      byComponent: this.groupBy(this.issues, 'component'),
      bySeverity: this.groupBy(this.issues, 'severity'),
      issues: this.issues.sort((a, b) => {
        const order = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return order[a.severity] - order[b.severity];
      })
    };
  }

  groupBy(items, key) {
    const grouped = {};
    items.forEach(item => {
      const value = item[key];
      if (!grouped[value]) grouped[value] = [];
      grouped[value].push(item);
    });
    return Object.entries(grouped).map(([key, items]) => ({
      name: key,
      count: items.length,
      issues: items
    }));
  }

  // Exportar como JSON
  exportJSON(type = 'full') {
    let report;
    if (type === 'frontend') {
      report = this.getFrontendReport();
    } else if (type === 'backend') {
      report = this.getBackendReport();
    } else {
      report = this.getFullReport();
    }

    const json = JSON.stringify(report, null, 2);
    this.downloadFile(json, `issues-report-${type}-${Date.now()}.json`);
    return json;
  }

  // Exportar como CSV
  exportCSV(type = 'full') {
    let issues;
    if (type === 'frontend') {
      issues = this.getFrontendReport().issues;
    } else if (type === 'backend') {
      issues = this.getBackendReport().issues;
    } else {
      issues = this.issues;
    }

    let csv = 'ID,Timestamp,Category,Component,Severity,Type,Message,Suggestion,Count\n';
    issues.forEach(issue => {
      const row = [
        issue.id,
        issue.timestamp,
        issue.category,
        issue.component,
        issue.severity,
        issue.type,
        `"${issue.message.replace(/"/g, '""')}"`,
        `"${issue.suggestion.replace(/"/g, '""')}"`,
        issue.count
      ];
      csv += row.join(',') + '\n';
    });

    this.downloadFile(csv, `issues-report-${type}-${Date.now()}.csv`);
    return csv;
  }

  downloadFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Limpar issues
  clear() {
    this.issues = [];
  }

  // Marcar como resolvido
  markAsResolved(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.resolved = true;
    }
  }

  // Adicionar nota
  addNote(issueId, note) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.notes = note;
    }
  }

  // Atribuir para alguém
  assignTo(issueId, person) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.assignee = person;
    }
  }

  getStats() {
    return {
      total: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'CRITICAL').length,
      high: this.issues.filter(i => i.severity === 'HIGH').length,
      medium: this.issues.filter(i => i.severity === 'MEDIUM').length,
      low: this.issues.filter(i => i.severity === 'LOW').length,
      unresolved: this.issues.filter(i => !i.resolved).length
    };
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ErrorMapper = ErrorMapper;
  window.errorMapper = ErrorMapper.getInstance();
}
