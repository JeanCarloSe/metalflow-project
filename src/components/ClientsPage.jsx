import React, { useState } from 'react';
import { hexToRgba } from '../services/themeService';

const EMPTY_FORM = { name: '', code: '', contact: '', email: '', website: '', primaryColor: '#3b82f6', logoUrl: '', tagline: '' };

const ClientsPage = ({ clients, onNewQuotation, onClientAdded, onEditClient, onViewClientHome, onSelect, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onClientAdded(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Clientes</h2>
          <p className="text-base text-gray-600 mt-2">
            {clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={`px-4 py-3 text-base font-medium rounded-lg transition-all ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          }`}
        >
          {showForm ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {/* New client form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Dados do Cliente</h3>

          {/* Name + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nome</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome ou empresa" className={inputCls} autoFocus />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Código de Cadastro</label>
              <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                placeholder="Ex: CLI-001" className={inputCls} />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Slogan / Segmento</label>
            <input type="text" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
              placeholder="Ex: Corte e Dobra de Precisão" className={inputCls} />
          </div>

          {/* Contact + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Telefone</label>
              <input type="text" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                placeholder="(00) 00000-0000" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@empresa.com" className={inputCls} />
            </div>
          </div>

          {/* Website + Logo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
              <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                placeholder="https://empresa.com.br" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">URL do Logo</label>
              <input type="url" value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://.../logo.png" className={inputCls} />
            </div>
          </div>

          {/* Brand color */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Cor da Marca</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
              />
              <div
                className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: form.primaryColor }}
              />
            </div>
          </div>

          {/* Logo preview */}
          {form.logoUrl && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview do logo</p>
              <img
                src={form.logoUrl}
                alt="Logo preview"
                className="max-h-12 object-contain"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full py-3 bg-blue-600 text-white font-semibold text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {saving ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </form>
      )}

      {/* Client list */}
      {clients.length === 0 && !showForm ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-gray-900 font-semibold mb-2 text-lg">Nenhum cliente ainda</p>
          <p className="text-base text-gray-600">Crie um cliente para vincular aos orçamentos</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(c => {
            const brand = c.primaryColor || '#3b82f6';
            return (
              <div
                key={c.id}
                className="bg-white border rounded-xl p-6 flex justify-between items-center transition-all group hover:shadow-md"
                style={{
                  borderColor: hexToRgba(brand, 0.3),
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = hexToRgba(brand, 0.5)}
                onMouseLeave={e => e.currentTarget.style.borderColor = hexToRgba(brand, 0.3)}
              >
                <div className="flex items-center gap-4">
                  {/* Logo or avatar */}
                  {c.logoUrl ? (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border"
                      style={{ backgroundColor: hexToRgba(brand, 0.1), borderColor: hexToRgba(brand, 0.3) }}
                    >
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        className="max-w-full max-h-full object-contain p-1"
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span style="color:${brand};font-weight:600;font-size:16px">${c.name.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border font-semibold text-lg"
                      style={{ backgroundColor: hexToRgba(brand, 0.15), borderColor: hexToRgba(brand, 0.35), color: brand }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{c.name}</h3>
                      <span className="text-sm text-gray-600">{c.code || 'S/código'}</span>
                    </div>
                    {c.tagline && <p className="text-sm mt-1" style={{ color: brand }}>{c.tagline}</p>}
                    <div className="flex gap-3 mt-2">
                      {c.contact && <p className="text-sm text-gray-600">{c.contact}</p>}
                      {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer"
                          className="text-sm hover:underline transition-colors"
                          style={{ color: brand }}
                        >
                          {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {onViewClientHome && (
                    <button
                      onClick={() => onViewClientHome(c)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border transition-all whitespace-nowrap"
                      style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.08) }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.18)}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.08)}
                    >
                      📊 Histórico
                    </button>
                  )}
                  {onEditClient && (
                    <button
                      onClick={() => onEditClient(c)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border transition-all whitespace-nowrap"
                      style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.08) }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.18)}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.08)}
                    >
                      ✏ Editar
                    </button>
                  )}
                  <button
                    onClick={() => onNewQuotation(c)}
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-sm whitespace-nowrap"
                    style={{ backgroundColor: brand }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}
                  >
                    ➕ Novo Orçamento
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
