import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ ERRO GLOBAL:', event.error);
  console.error('Stack:', event.error?.stack);
  alert('Erro: ' + event.error?.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ PROMISE REJECTION:', event.reason);
  alert('Erro na promessa: ' + event.reason?.message);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
