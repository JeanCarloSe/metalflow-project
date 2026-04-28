import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import { updateClient } from '../services/storageService';

const ROLES = ['Comprador', 'Responsável', 'Engenharia', 'Comercial', 'Outro'];

const emptyContact = () => ({ id: Date.now().toString(), name: '', email: '', phone: '', role: ROLES[0] });

const ClientDetailModal = ({ client, quotations, onSave, onClose }) => {
  const brand = client.primaryColor || ASTON_BRAND;

  const [name,         setName]         = useState(client.name         || '');
  const [code,         setCode]         = useState(client.code         || '');
  const [tagline,      setTagline]      = useState(client.tagline      || '');
  const [website,      setWebsite]      = useState(client.website      || '');
  const [logoUrl,      setLogoUrl]      = useState(client.logoUrl      || '');
  const [primaryColor, setPrimaryColor] = useState(client.primaryColor || ASTON_BRAND);
  const [contacts,     setContacts]     = useState(client.contacts     || []);
  const [tab,          setTab]          = useState('info');
  const [saving,       setSaving]       = useState(false);
  const [logoOk,       setLogoOk]       = useState(true);

  const clientQuotations = quotations.filter(q => q.clientId === client.id);
  const clientTotal = clientQuotations.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const addContact = () => setContacts(prev => [...prev, emptyContact()]);
  const removeContact = (id) => setContacts(prev => prev.filter(c => c.id !== id));
  const updateContact = (id, field, value) =>
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const updated = { ...client, name: name.trim(), code: code.trim(), tagline, website, logoUrl, primaryColor, contacts };
    await updateClient(updated);
    setSaving(false);
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderColor: hexToRgba(brand, 0.3), background: hexToRgba(brand, 0.06) }}>
          <div className="flex items-center gap-3">
            {logoUrl && logoOk ? (
              <img src={logoUrl} alt={client.name} className="h-8 object-contain"
                onError={() => setLogoOk(false)} />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-sm"
                style={{ backgroundColor: hexToRgba(brand, 0.2), color: brand }}>
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-100">{name || client.name}</p>
              <p className="text-xs font-mono text-gray-600">{client.code || 'S/código'}</p>
              <p className="text-xs font-mono text-gray-500 mt-1">{clientQuotations.length} orçamentos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-xl font-mono">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 flex-shrink-0">
          {[{ id: 'info', label: 'Dados' }, { id: 'contacts', label: `Contatos (${contacts.length})` }, { id: 'history', label: `Orçamentos (${clientQuotations.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-3 text-sm font-mono font-medium transition-all"
              style={tab === t.id ? { color: brand, borderBottom: `2px solid ${brand}`, marginBottom: '-1px' } : { color: '#6b7280' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {tab === 'info' && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Nome *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Código de Cadastro</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Ex: CLI-001" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Tagline / Slogan</label>
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Ex: Tecnologia e Precisão" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Website</label>
                  <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Cor principal</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0.5" />
                    <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">URL do Logo</label>
                <input type="text" value={logoUrl} onChange={e => { setLogoUrl(e.target.value); setLogoOk(true); }} placeholder="https://..." className={inputCls} />
              </div>
            </>
          )}

          {tab === 'contacts' && (
            <div className="space-y-4">
              {contacts.length === 0 && (
                <p className="text-center text-gray-600 font-mono text-sm py-4">Nenhum contato cadastrado.</p>
              )}
              {contacts.map(c => (
                <div key={c.id} className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-600 mb-1.5">Nome</label>
                      <input type="text" value={c.name} onChange={e => updateContact(c.id, 'name', e.target.value)}
                        placeholder="Nome do contato" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-600 mb-1.5">Cargo</label>
                      <select value={c.role} onChange={e => updateContact(c.id, 'role', e.target.value)} className={inputCls + ' cursor-pointer'}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-600 mb-1.5">E-mail</label>
                      <input type="email" value={c.email} onChange={e => updateContact(c.id, 'email', e.target.value)}
                        placeholder="email@empresa.com" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-600 mb-1.5">Telefone</label>
                      <input type="text" value={c.phone} onChange={e => updateContact(c.id, 'phone', e.target.value)}
                        placeholder="(00) 00000-0000" className={inputCls} />
                    </div>
                  </div>
                  <button onClick={() => removeContact(c.id)}
                    className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors">
                    Remover contato
                  </button>
                </div>
              ))}
              <button onClick={addContact}
                className="w-full py-2.5 border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-500 rounded-xl font-mono text-sm transition-all">
                + Adicionar contato
              </button>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              {clientQuotations.length === 0 && (
                <p className="text-center text-gray-600 font-mono text-sm py-4">Nenhum orçamento para este cliente.</p>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-gray-700/40">
                <p className="text-xs font-mono text-gray-500">{clientQuotations.length} orçamentos</p>
                <p className="font-mono font-bold text-sm" style={{ color: brand }}>
                  Total: R$ {clientTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {[...clientQuotations].reverse().map(q => (
                <div key={q.id} className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono font-bold" style={{ color: brand }}>{q.number || q.id}</p>
                      {q.editHistory?.length > 0 && (
                        <span className="text-xs font-mono text-gray-600">· {q.editHistory.length} edição{q.editHistory.length !== 1 ? 'ões' : ''}</span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">
                      {q.material} · {q.thickness}mm · {q.workType} · Qtd {q.quantity}
                    </p>
                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                      {new Date(q.date).toLocaleDateString('pt-BR')}
                      {q.operator && ` · ${q.operator.name}`}
                    </p>
                  </div>
                  <p className="font-mono font-bold" style={{ color: brand }}>R$ {q.totalPrice}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {tab !== 'history' && (
          <div className="border-t border-gray-700/40 px-6 py-4 flex gap-3 flex-shrink-0">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-600 text-gray-400 font-mono text-sm rounded-lg hover:bg-gray-700/40 transition-all">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="flex-1 py-2.5 text-white font-mono text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: brand }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailModal;
