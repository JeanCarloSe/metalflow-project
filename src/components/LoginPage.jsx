import React, { useState } from 'react';
import { loginUser, createUser } from '../services/authService';
import { ASTON_BRAND } from '../services/themeService';
import { loginViaBackend, registerViaBackend } from '../services/backendApi';

const ASTON_LOGO = 'https://astonmetalurgica.com.br/wp-content/uploads/2020/05/cropped-Logo-Aston-240x80.png';

const ASTON_CONTACT = {
  phones: ['+55 (47) 3436-4569', '+55 (47) 3801-7575'],
  email: 'aston@astonmetalurgica.com.br',
  website: 'https://astonmetalurgica.com.br'
};

const LoginPage = ({ onLogin, isFirstAccess }) => {
  const [mode,     setMode]     = useState(isFirstAccess ? 'create' : 'login');
  const [login,    setLogin]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [number,   setNumber]   = useState('');
  const [role,     setRole]     = useState('operator');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [logoOk,   setLogoOk]   = useState(true);

  const inputCls = 'input-premium w-full';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password) { setError('Preencha login e senha.'); return; }
    if (mode === 'create' && !name.trim()) { setError('Informe seu nome.'); return; }
    setLoading(true);
    try {
      const tenantId = 'aston-metalurgica'; // ID do tenant (fixo por enquanto)
      localStorage.setItem('metalflow_tenant', tenantId);

      if (mode === 'login') {
        // ✅ Backend seguro com HttpOnly cookies
        const result = await loginUser(login, password, tenantId);
        if (!result.ok) { setError(result.error); return; }
        onLogin(result.user);
      } else {
        console.error('Backend registration not yet implemented');
        setError('Registro via backend em desenvolvimento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-12">
          {logoOk ? (
            <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-20 object-contain mx-auto mb-6"
              style={{ imageRendering: 'crisp-edges' }}
              onError={() => setLogoOk(false)} />
          ) : (
            <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>ASTON</h1>
          )}
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>Sistema de Orçamentos</p>
        </div>

        <div className="card-premium overflow-hidden">

          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: '2px solid var(--color-border-light)' }}>
            {[{ id: 'login', label: 'Entrar' }, { id: 'create', label: 'Novo usuário' }].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id); setError(''); }}
                className="flex-1 py-4 text-base font-medium transition-all"
                style={mode === t.id ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', marginBottom: '-2px' } : { color: 'var(--color-text-muted)' }}>
                {t.label}
              </button>
            ))}
          </div>

          {isFirstAccess && (
            <div className="px-8 pt-8 pb-0">
              <p className="text-sm font-semibold text-center" style={{ color: 'var(--color-primary)' }}>Primeiro acesso</p>
              <p className="text-center text-base mt-2 mb-6" style={{ color: 'var(--color-text-secondary)' }}>Crie o usuário administrador</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">

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
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
            <a href={`tel:${ASTON_CONTACT.phones[0].replace(/\D/g, '')}`}
              className="transition-colors" style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}>
              {ASTON_CONTACT.phones[0]}
            </a>
            <span style={{ color: 'var(--color-border-light)' }}>·</span>
            <a href={`mailto:${ASTON_CONTACT.email}`}
              className="transition-colors" style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}>
              {ASTON_CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
