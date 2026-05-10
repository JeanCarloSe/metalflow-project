import React, { useState } from 'react';
import { ASTON_BRAND } from '../services/themeService';
import MultiUserService from '../services/multiUserService';
import Logo from './Logo';

const LoginPage = ({ onLogin, isFirstAccess }) => {
  const [mode,     setMode]     = useState(isFirstAccess ? 'create' : 'login');
  const [login,    setLogin]    = useState(() => {
    try {
      const saved = localStorage.getItem('metalflow_login');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState(() => {
    try {
      const saved = localStorage.getItem('metalflow_password');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('metalflow_remember') === 'true';
    } catch {
      return false;
    }
  });
  const [name,     setName]     = useState('');
  const [number,   setNumber]   = useState('');
  const [role,     setRole]     = useState('operator');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const inputCls = 'input-premium w-full';

  const doLogin = async (userData) => {
    const multiUserService = MultiUserService.getInstance();
    multiUserService.currentUser = userData;
    await multiUserService.loadUserPermissions(userData.id);
    if (rememberMe) {
      localStorage.setItem('metalflow_login', login);
      localStorage.setItem('metalflow_remember', 'true');
    } else {
      localStorage.removeItem('metalflow_login');
      localStorage.removeItem('metalflow_remember');
    }
    localStorage.setItem('metalflow_user', JSON.stringify(userData));
    onLogin(userData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password) { setError('Preencha login e senha.'); return; }
    if (mode === 'create' && !name.trim()) { setError('Informe seu nome.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        // Login via D1 API
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: login.trim(), password }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          await doLogin(data.user);
        } else {
          setError(data.error || 'Credenciais inválidas.');
        }
      } else {
        // Registro via D1 API (apenas primeiro acesso — fluxo normal é pelo admin)
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: login.trim(), password, name, role }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          await doLogin(data.user);
        } else {
          setError(data.error || 'Erro ao criar usuário.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="mb-3 sm:mb-4 md:mb-6 flex justify-center">
            <Logo size="lg" />
          </div>
          <p className="text-xs sm:text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>Sistema de Orçamentos</p>
        </div>

        <div className="card-premium overflow-hidden">

          {/* Tab switcher — "Novo usuário" só aparece no primeiro acesso */}
          {isFirstAccess && (
            <div className="flex" style={{ borderBottom: '2px solid var(--color-border-light)' }}>
              {[{ id: 'login', label: 'Entrar' }, { id: 'create', label: 'Novo usuário' }].map(t => (
                <button key={t.id} onClick={() => { setMode(t.id); setError(''); }}
                  className="flex-1 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium transition-all"
                  style={mode === t.id ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', marginBottom: '-2px' } : { color: 'var(--color-text-muted)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {isFirstAccess && (
            <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-0">
              <p className="text-xs sm:text-sm font-semibold text-center" style={{ color: 'var(--color-primary)' }}>Primeiro acesso</p>
              <p className="text-center text-xs sm:text-sm md:text-base mt-2 mb-4 sm:mb-6" style={{ color: 'var(--color-text-secondary)' }}>Crie o usuário administrador</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4 md:space-y-6">

            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Nome completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome" className={inputCls} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Matrícula / Número</label>
                  <input type="text" value={number} onChange={e => setNumber(e.target.value)}
                    placeholder="Ex: OP-001" className={inputCls} />
                </div>
                {!isFirstAccess && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Tipo de usuário</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                      <option value="operator">Operador (cria orçamentos)</option>
                      <option value="admin">Administrador (gerencia tudo)</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Login</label>
              <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                placeholder="usuario" className={inputCls} autoFocus={mode === 'login'} autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Lembrar-me neste navegador</span>
              </label>
            )}

            {error && (
              <div className="badge-error bg-opacity-10 border p-4 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-premium w-full mt-4">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="px-8 py-6 rounded-b-2xl space-y-3" style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border-light)' }}>
          <p className="text-xs font-semibold text-center" style={{ color: 'var(--color-text-secondary)' }}>Suporte</p>
          <div className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>MetalFlow © 2024 - Desenvolvido com dedicação</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
