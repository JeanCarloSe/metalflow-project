import html2pdf from 'html2pdf.js';
import { QUOTATION_STATUS } from './statusService';

const BRAND_COLOR = '#0170B9';
// Logo URL removed - using text-based branding instead

export const generateQuotationPDF = async (quotation, client) => {
  if (!quotation || !client) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('pt-BR');
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6;">

      <!-- HEADER COM GRADIENTE -->
      <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #0D47A1 100%); padding: 40px 30px; margin: -10px -10px 40px -10px; border-radius: 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">METALFLOW</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Sistema de Orçamentos Premium</p>
          </div>
          <div style="text-align: right;">
            <p style="color: rgba(255,255,255,0.8); margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Orçamento Nº</p>
            <p style="color: white; margin: 0; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace;">${quotation.number}</p>
          </div>
        </div>
      </div>

      <!-- INFO RÁPIDO: Data, Operador e Status -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid ${BRAND_COLOR};">
          <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Data</p>
          <p style="color: #1f2937; margin: 0; font-size: 14px; font-weight: 600;">${formatDate(quotation.date)}</p>
        </div>
        <div style="flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid ${BRAND_COLOR};">
          <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Operador</p>
          <p style="color: #1f2937; margin: 0; font-size: 14px; font-weight: 600;">${quotation.operator?.name || 'N/A'}</p>
          <p style="color: #9ca3af; margin: 3px 0 0 0; font-size: 11px;">Matrícula: ${quotation.operator?.number || 'N/A'}</p>
        </div>
        ${quotation.status ? `
        <div style="flex: 1; background: ${QUOTATION_STATUS[quotation.status]?.bgColor || '#f8f9fa'}; padding: 15px; border-radius: 8px; border-left: 3px solid ${QUOTATION_STATUS[quotation.status]?.color || BRAND_COLOR};">
          <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
          <p style="color: ${QUOTATION_STATUS[quotation.status]?.color || '#1f2937'}; margin: 0; font-size: 14px; font-weight: 700;">${QUOTATION_STATUS[quotation.status]?.label || quotation.status}</p>
        </div>
        ` : ''}
      </div>

      <!-- CLIENTE -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</p>
        <p style="color: #1f2937; margin: 0 0 5px 0; font-size: 16px; font-weight: 700;">${client.name}</p>
        ${client.code ? `<p style="color: #6b7280; margin: 3px 0; font-size: 12px;"><strong>Código:</strong> ${client.code}</p>` : ''}
        ${client.contact ? `<p style="color: #6b7280; margin: 3px 0; font-size: 12px;"><strong>Contato:</strong> ${client.contact}</p>` : ''}
        ${client.email ? `<p style="color: #6b7280; margin: 3px 0; font-size: 12px;"><strong>Email:</strong> ${client.email}</p>` : ''}
        ${client.phone ? `<p style="color: #6b7280; margin: 3px 0; font-size: 12px;"><strong>Telefone:</strong> ${client.phone}</p>` : ''}
      </div>

      <!-- PEÇAS TABELA -->
      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Peças Orçadas</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: ${BRAND_COLOR}; color: white;">
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 12px;">Peça</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px;">Material</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px;">Dimensões (mm)</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px;">Qtd</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 12px;">Serviços</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 12px;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.lines?.map((line, idx) => {
            const services = Array.isArray(line.services)
              ? line.services.map(s => typeof s === 'string' ? s : s.name).join(', ')
              : '—';
            const valuPerPiece = parseFloat(quotation.totalPrice || 0) / (quotation.lines?.length || 1);
            const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
            return `
              <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 600; color: #1f2937;">${line.name}</td>
                <td style="padding: 12px; text-align: center; color: #4b5563; font-size: 12px;">${line.material || '—'}</td>
                <td style="padding: 12px; text-align: center; color: #4b5563; font-size: 12px; font-family: 'Courier New', monospace;">${line.lengthMm} × ${line.widthMm} × ${line.thicknessMm}</td>
                <td style="padding: 12px; text-align: center; color: #4b5563; font-size: 12px;">${line.quantity || 1}</td>
                <td style="padding: 12px; color: #4b5563; font-size: 11px;">${services}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: ${BRAND_COLOR}; font-family: 'Courier New', monospace;">${formatCurrency(valuPerPiece)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- VALOR TOTAL -->
      <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #0047a3 100%); padding: 40px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <p style="color: rgba(255,255,255,0.8); margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Valor Total do Orçamento</p>
        <p style="color: white; margin: 0; font-size: 48px; font-weight: 700; font-family: 'Courier New', monospace;">${formatCurrency(quotation.totalPrice || 0)}</p>
        <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0; font-size: 12px;">Peso total: ${parseFloat(quotation.totalWeight || 0).toFixed(2)} kg</p>
      </div>

      <!-- OBSERVAÇÕES -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Observações</p>
        <p style="color: #4b5563; margin: 0; font-size: 12px;">Cotação válida por 30 dias. Sujeita a alterações conforme variação de preços no mercado.</p>
      </div>

      <!-- RODAPÉ -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 11px;">
        <p style="margin: 0 0 5px 0;"><strong style="color: ${BRAND_COLOR};">METALFLOW</strong></p>
        <p style="margin: 0 0 3px 0;">Sistema de Orçamentos Inteligentes</p>
        <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 10px;">Orçamento gerado em ${new Date().toLocaleString('pt-BR')}</p>
      </div>

    </div>
  `;

  return new Promise((resolve) => {
    const options = {
      margin: [15, 15, 15, 15],
      filename: `ORC-${quotation.number}.pdf`,
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: { scale: 3, useCORS: true, logging: false },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(html).save();
    resolve(true);
  });
};

export const downloadQuotationPDF = async (quotation, client) => {
  await generateQuotationPDF(quotation, client);
};
