import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PerformanceMonitor } from './utils/performanceMonitor'
import { ErrorMapper } from './utils/errorMapper'

// Inicializar sistemas de monitoramento PRIMEIRO
console.log('🔧 Inicializando sistemas de monitoramento...');

try {
  const perfMonitor = PerformanceMonitor.getInstance();
  window.perfMonitor = perfMonitor;
  window.PerformanceMonitor = PerformanceMonitor;
  console.log('✅ PerformanceMonitor inicializado:', window.perfMonitor);
} catch (e) {
  console.error('❌ Erro ao inicializar PerformanceMonitor:', e);
}

try {
  const errorMapper = ErrorMapper.getInstance();
  window.errorMapper = errorMapper;
  window.ErrorMapper = ErrorMapper;
  console.log('✅ ErrorMapper inicializado:', window.errorMapper);
} catch (e) {
  console.error('❌ Erro ao inicializar ErrorMapper:', e);
}

// Garantir que estão acessíveis
console.log('📍 Verificação final:');
console.log('  - window.perfMonitor:', !!window.perfMonitor);
console.log('  - window.errorMapper:', !!window.errorMapper);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '40px', fontFamily: 'monospace', background: '#f0f0f0', minHeight: '100vh'}}>
          <h1>❌ Erro na Aplicação</h1>
          <p><strong>Mensagem:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong></p>
          <pre style={{background: '#fff', padding: '10px', overflow: 'auto', maxHeight: '300px'}}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} style={{padding: '10px 20px', cursor: 'pointer'}}>
            Limpar dados e recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  console.error('❌ ERRO GLOBAL:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ PROMISE REJECTION:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ErrorBoundary>,
)
