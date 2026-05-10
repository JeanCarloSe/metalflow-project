import React, { useState } from 'react';
import { MetalFlowLogoWithText } from './MetalFlowLogo';

const LoginPage = ({ onLogin }) => {
  const [mode,     setMode]     = useState('login');
  const [login,    setLogin]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('operator');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password) { setError('Preencha login e senha.'); return; }
    if (mode === 'create' && !name.trim()) { setError('Informe seu nome.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: login.trim(), password }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          localStorage.setItem('metalflow_user', JSON.stringify(data.user));
          onLogin(data.user);
        } else {
          setError(data.error || 'Credenciais inválidas.');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: login.trim(), password, name, role }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          localStorage.setItem('metalflow_user', JSON.stringify(data.user));
          onLogin(data.user);
        } else {
          setError(data.error || 'Erro ao criar usuário.');
        }
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inp = `w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all outline-none
    bg-white text-gray-900 placeholder-gray-400
    border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* LEFT — dark industrial panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #091E42 0%, #0A2D5E 40%, #003D99 100%)',
        }}
      >
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '200px', height: '200px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.12)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0052CC, #2684FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,82,204,0.5)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">
                Metal<span style={{ color: '#2684FF' }}>Flow</span>
              </p>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Gestão de Orçamentos
              </p>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
              Orçamentos<br />
              <span style={{ color: '#2684FF' }}>industriais</span><br />
              com precisão.
            </h1>
            <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 380 }}>
              Calcule cortes, chapas e perfis de metal com velocidade e exatidão. Gerencie clientes, acompanhe negociações e feche mais contratos.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: '⚡', text: 'Cálculo automático de peso e custo' },
              { icon: '📊', text: 'Dashboard com analytics em tempo real' },
              { icon: '🤝', text: 'Gestão de negociações por status' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(38,132,255,0.15)',
                  border: '1px solid rgba(38,132,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2025 MetalFlow · Todos os direitos reservados
        </p>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F4F5F7 60%, #EBF0FF 100%)' }}>

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <p className="text-2xl font-black" style={{ color: '#091E42', letterSpacing: '-0.03em' }}>
              Metal<span style={{ color: '#0052CC' }}>Flow</span>
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Gestão de Orçamentos Industriais</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: '0 20px 60px rgba(9,30,66,0.12)' }}>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              {[{ id: 'login', label: 'Entrar' }, { id: 'create', label: 'Criar conta' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setMode(t.id); setError(''); }}
                  className="flex-1 py-3.5 text-sm font-bold transition-all"
                  style={mode === t.id
                    ? { color: '#0052CC', borderBottom: '2.5px solid #0052CC', marginBottom: '-1px', backgroundColor: 'rgba(0,82,204,0.02)' }
                    : { color: 'var(--color-text-muted)' }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              {mode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Nome completo
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Seu nome" className={inp} autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Perfil de acesso
                    </label>
                    <select value={role} onChange={e => setRole(e.target.value)} className={inp}>
                      <option value="operator">Orçamentista</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Usuário
                </label>
                <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                  placeholder="usuario" className={inp} autoFocus={mode === 'login'} autoComplete="username" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Senha
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={inp} autoComplete="current-password" />
              </div>

              {error && (
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'var(--color-error-light)' }}>
                  <span style={{ color: 'var(--color-error)', fontSize: 14 }}>⚠</span>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #0052CC 0%, #003D99 100%)',
                  boxShadow: '0 4px 12px rgba(0,82,204,0.35)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.filter = 'brightness(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                {loading ? '⏳ Aguarde...' : mode === 'login' ? 'Entrar no sistema' : 'Criar minha conta'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
