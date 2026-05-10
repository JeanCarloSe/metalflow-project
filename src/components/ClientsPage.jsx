import React, { useState } from 'react';
import { hexToRgba } from '../services/themeService';
import ClientDetailModal from './ClientDetailModal';

const PRIMARY = '#0052CC';
const EMPTY_FORM = { name: '', code: '', contact: '', email: '', website: '', primaryColor: '#0052CC', logoUrl: '', tagline: '' };

const ClientsPage = ({ clients, quotations = [], onNewQuotation, onClientAdded, onEditClient, onDeleteClient, onViewClientHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [detailClient, setDetailClient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onClientAdded(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remover cliente "${c.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(c.id);
    await onDeleteClient?.(c.id);
    setDeletingId(null);
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all';

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6 py-8">

      {/* Header */}
      <div className="flex justify-between items-end border-b-4 pb-4" style={{ borderColor: PRIMARY }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: PRIMARY }}>Clientes</h1>
          <p className="text-base font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-5 py-2 text-sm font-semibold rounded-lg shadow-md transition-all"
          style={showForm
            ? { backgroundColor: '#EBECF0', color: 'var(--color-text-secondary)' }
            : { backgroundColor: PRIMARY, color: '#fff' }
          }
        >
          {showForm ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {/* New client form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-glass rounded-xl p-8 space-y-6 border-t-4" style={{ borderTopColor: PRIMARY }}>
          <h3 className="text-xl font-bold" style={{ color: PRIMARY }}>Dados do Cliente</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Nome</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome ou empresa" className={inputCls} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Código</label>
              <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                placeholder="Ex: CLI-001" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Slogan / Segmento</label>
            <input type="text" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
              placeholder="Ex: Corte e Dobra de Precisão" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Telefone</label>
              <input type="text" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                placeholder="(00) 00000-0000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@empresa.com" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Website</label>
              <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                placeholder="https://empresa.com.br" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>URL do Logo</label>
              <input type="url" value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://.../logo.png" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Cor da Marca</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor}
                onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
              <input type="text" value={form.primaryColor}
                onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                placeholder="#0052CC"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:border-blue-500 transition-all font-mono" />
              <div className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0" style={{ backgroundColor: form.primaryColor }} />
            </div>
          </div>

          {form.logoUrl && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview do logo</p>
              <img src={form.logoUrl} alt="Logo preview" className="max-h-12 object-contain"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}

          <button type="submit" disabled={saving || !form.name.trim()}
            className="w-full py-3 text-white font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:brightness-110"
            style={{ backgroundColor: PRIMARY }}>
            {saving ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </form>
      )}

      {/* Client list */}
      {clients.length === 0 && !showForm ? (
        <div className="card-glass rounded-xl p-16 text-center">
          <p className="text-5xl mb-4">🏢</p>
          <p className="font-semibold text-gray-500 text-lg">Nenhum cliente ainda</p>
          <p className="text-sm text-gray-400 mt-1">Crie um cliente para vincular aos orçamentos</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(c => {
            const brand = c.primaryColor || PRIMARY;
            const isDeleting = deletingId === c.id;
            return (
              <div
                key={c.id}
                className="card-glass rounded-xl p-6 flex justify-between items-center transition-all group hover:shadow-lg"
                style={{ borderLeft: `4px solid ${hexToRgba(brand, 0.6)}` }}
              >
                <div className="flex items-center gap-4">
                  {c.logoUrl ? (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border"
                      style={{ backgroundColor: hexToRgba(brand, 0.1), borderColor: hexToRgba(brand, 0.25) }}>
                      <img src={c.logoUrl} alt={c.name} className="max-w-full max-h-full object-contain p-1"
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span style="color:${brand};font-weight:700;font-size:18px">${c.name.charAt(0).toUpperCase()}</span>`;
                        }} />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border font-bold text-xl"
                      style={{ backgroundColor: hexToRgba(brand, 0.15), borderColor: hexToRgba(brand, 0.3), color: brand }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{c.name}</h3>
                      {c.code && <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>}
                    </div>
                    {c.tagline && <p className="text-sm mt-0.5" style={{ color: brand }}>{c.tagline}</p>}
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {c.contact && <p className="text-xs text-gray-500">📞 {c.contact}</p>}
                      {c.email && <p className="text-xs text-gray-500">✉ {c.email}</p>}
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: brand }}>
                          🌐 {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setDetailClient(c)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap"
                    style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.07) }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.15)}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.07)}>
                    📊 Histórico
                  </button>

                  {onEditClient && (
                    <button onClick={() => onEditClient(c)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap"
                      style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.07) }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.15)}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.07)}>
                      ✏ Editar
                    </button>
                  )}

                  <button onClick={() => onNewQuotation(c)}
                    className="px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all shadow-sm whitespace-nowrap"
                    style={{ backgroundColor: brand }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}>
                    ➕ Orçamento
                  </button>

                  {onDeleteClient && (
                    <button onClick={() => handleDelete(c)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap disabled:opacity-40"
                      style={{ color: 'var(--color-error)', borderColor: 'rgba(222,53,11,0.3)', backgroundColor: 'rgba(222,53,11,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(222,53,11,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(222,53,11,0.05)'}>
                      {isDeleting ? '...' : '🗑'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailClient && (
        <ClientDetailModal
          client={detailClient}
          quotations={quotations}
          onSave={(updated) => {
            onEditClient?.(updated);
            setDetailClient(updated);
          }}
          onClose={() => setDetailClient(null)}
        />
      )}
    </div>
  );
};

export default ClientsPage;
