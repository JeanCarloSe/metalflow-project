import React, { useState } from 'react';
import { loginUser, createUser } from '../services/authService';
import { ASTON_BRAND } from '../services/themeService';

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

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password) { setError('Preencha login e senha.'); return; }
    if (mode === 'create' && !name.trim()) { setError('Informe seu nome.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await loginUser(login, password);
        if (!result.ok) { setError(result.error); return; }
        onLogin(result.user);
      } else {
        const userRole = isFirstAccess ? 'admin' : role;
        const result = await createUser(login, password, name, number, userRole);
        if (!result.ok) { setError(result.error); return; }
        const loginResult = await loginUser(login, password);
        if (loginResult.ok) onLogin(loginResult.user);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-12">
          {logoOk ? (
            <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-20 object-contain mx-auto mb-6"
              style={{ imageRendering: 'crisp-edges' }}
              onError={() => setLogoOk(false)} />
          ) : (
            <p className="text-4xl font-bold mb-6" style={{ color: ASTON_BRAND }}>ASTON</p>
          )}
          <p className="text-gray-600 text-base">Sistema de Orçamentos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200">
            {[{ id: 'login', label: 'Entrar' }, { id: 'create', label: 'Novo usuário' }].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id); setError(''); }}
                className="flex-1 py-4 text-base font-medium transition-all"
                style={mode === t.id ? { color: ASTON_BRAND, borderBottom: `2px solid ${ASTON_BRAND}`, marginBottom: '-1px' } : { color: '#9ca3af' }}>
                {t.label}
              </button>
            ))}
          </div>

          {isFirstAccess && (
            <div className="px-8 pt-8 pb-0">
              <p className="text-sm font-semibold text-center" style={{ color: ASTON_BRAND }}>Primeiro acesso</p>
              <p className="text-center text-gray-600 text-base mt-2 mb-6">Crie o usuário administrador</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">

            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Nome completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome" className={inputCls} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Matrícula / Número</label>
                  <input type="text" value={number} onChange={e => setNumber(e.target.value)}
                    placeholder="Ex: OP-001" className={inputCls} />
                </div>
                {!isFirstAccess && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de usuário</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                      <option value="operator">Operador (cria orçamentos)</option>
                      <option value="admin">Administrador (gerencia tudo)</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Login</label>
              <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                placeholder="usuario" className={inputCls} autoFocus={mode === 'login'} autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white font-semibold text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mt-4"
              style={{ backgroundColor: ASTON_BRAND }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => e.currentTarget.style.filter = ''}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-600 text-center">Suporte</p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
            <a href={`tel:${ASTON_CONTACT.phones[0].replace(/\D/g, '')}`}
              className="text-gray-700 hover:text-blue-600 transition-colors">
              {ASTON_CONTACT.phones[0]}
            </a>
            <span className="text-gray-300">·</span>
            <a href={`mailto:${ASTON_CONTACT.email}`}
              className="text-gray-700 hover:text-blue-600 transition-colors">
              {ASTON_CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
