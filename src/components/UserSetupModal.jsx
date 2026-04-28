import React, { useState } from 'react';

const ASTON_LOGO = 'https://astonmetalurgica.com.br/wp-content/uploads/2020/05/cropped-Logo-Aston-240x80.png';
const ASTON_COLOR = '#0170B9';

const UserSetupModal = ({ onSave, existingOperator }) => {
  const [name,   setName]   = useState(existingOperator?.name   || '');
  const [number, setNumber] = useState(existingOperator?.number || '');
  const [logoOk, setLogoOk] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name:   name.trim(),
      number: number.trim() || `OP-${String(Date.now()).slice(-3)}`,
    });
  };

  const inputCls = 'w-full px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-gray-600 rounded-lg font-mono text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Brand header */}
        <div className="px-8 py-6 flex flex-col items-center border-b border-gray-700/60"
          style={{ background: `linear-gradient(135deg, ${ASTON_COLOR}18 0%, transparent 100%)` }}>
          {logoOk ? (
            <img
              src={ASTON_LOGO}
              alt="Aston Metalúrgica"
              className="h-10 object-contain mb-3"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span className="text-2xl font-bold font-mono mb-3" style={{ color: ASTON_COLOR }}>ASTON</span>
          )}
          <p className="text-xs font-mono text-gray-500 text-center">
            {existingOperator ? 'Editar perfil do operador' : 'Identifique-se para começar'}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                Nome do Operador *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={inputCls}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                Número / Matrícula
              </label>
              <input
                type="text"
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="Ex: OP-001"
                className={inputCls}
              />
              <p className="text-xs text-gray-600 font-mono mt-1.5">
                Gerado automaticamente se deixado em branco
              </p>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg mt-2"
              style={{ backgroundColor: ASTON_COLOR }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              {existingOperator ? 'Salvar Alterações' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSetupModal;
