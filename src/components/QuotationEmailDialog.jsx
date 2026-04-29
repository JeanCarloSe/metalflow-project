import React, { useState } from 'react';
import { sendQuotationEmail } from '../services/integrationsService';
import './QuotationEmailDialog.css';

export function QuotationEmailDialog({ quotation, onClose }) {
  const [email, setEmail] = useState(quotation.client?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tenantId = localStorage.getItem('metalflow_tenant') || 'default';

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setMessage('❌ Email inválido');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await sendQuotationEmail(tenantId, quotation.id, email);

      if (response.success) {
        setMessage(`✅ ${response.message}`);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📧 Enviar Orçamento com PDF</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Email do Cliente:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@example.com"
              disabled={loading}
            />
          </div>

          <div className="quotation-preview">
            <h3>📋 Resumo do Orçamento</h3>
            <p><strong>Número:</strong> {quotation.number}</p>
            <p><strong>Cliente:</strong> {quotation.client?.name}</p>
            <p><strong>Valor:</strong> R$ {quotation.totalPrice?.toFixed(2)}</p>
            <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
              ✅ PDF será gerado no servidor e enviado com proteção contra cópia
            </p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={loading} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !email}
            className="btn-primary"
          >
            {loading ? '📤 Enviando...' : '📨 Enviar com PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
