import express from 'express';
import { query, run, get } from '../db/database.js';
import { authenticate, validateTenant } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(validateTenant);

/**
 * 🔄 GET /api/sync/snapshot - Obter snapshot completo do banco
 * Para sincronização inicial quando offline
 */
router.get('/snapshot', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const clients = await query(
      'SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );

    const materials = await query(
      'SELECT * FROM materials WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );

    const quotations = await query(
      'SELECT * FROM quotations WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );

    // Obter todas as linhas para todos os orçamentos
    const lines = await query(
      `SELECT ql.* FROM quotation_lines ql
       JOIN quotations q ON ql.quotation_id = q.id
       WHERE q.tenant_id = ?
       ORDER BY ql.created_at DESC`,
      [tenantId]
    );

    res.json({
      ok: true,
      snapshot: {
        timestamp: new Date().toISOString(),
        clients,
        materials,
        quotations,
        lines,
      },
    });
  } catch (error) {
    console.error('Snapshot error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔄 GET /api/sync/delta - Obter apenas mudanças desde um timestamp
 * Para sincronização incremental
 */
router.get('/delta', async (req, res) => {
  try {
    const { since } = req.query;
    const tenantId = req.tenantId;

    if (!since) {
      return res.status(400).json({ error: 'Parâmetro "since" obrigatório (ISO timestamp)' });
    }

    const sinceDate = new Date(since);

    // Obter mudanças em clientes
    const clientChanges = await query(
      'SELECT * FROM clients WHERE tenant_id = ? AND updated_at > ? ORDER BY updated_at DESC',
      [tenantId, sinceDate.toISOString()]
    );

    // Obter mudanças em materiais
    const materialChanges = await query(
      'SELECT * FROM materials WHERE tenant_id = ? AND updated_at > ? ORDER BY updated_at DESC',
      [tenantId, sinceDate.toISOString()]
    );

    // Obter mudanças em orçamentos
    const quotationChanges = await query(
      'SELECT * FROM quotations WHERE tenant_id = ? AND updated_at > ? ORDER BY updated_at DESC',
      [tenantId, sinceDate.toISOString()]
    );

    // Obter mudanças em linhas
    const lineChanges = await query(
      `SELECT ql.* FROM quotation_lines ql
       JOIN quotations q ON ql.quotation_id = q.id
       WHERE q.tenant_id = ? AND ql.updated_at > ?
       ORDER BY ql.updated_at DESC`,
      [tenantId, sinceDate.toISOString()]
    );

    // Obter log de sync para detectar deletions
    const syncLog = await query(
      'SELECT * FROM sync_log WHERE tenant_id = ? AND created_at > ? ORDER BY created_at DESC',
      [tenantId, sinceDate.toISOString()]
    );

    res.json({
      ok: true,
      delta: {
        timestamp: new Date().toISOString(),
        since: sinceDate.toISOString(),
        clients: clientChanges,
        materials: materialChanges,
        quotations: quotationChanges,
        lines: lineChanges,
        deletions: syncLog.filter(log => log.action === 'DELETE'),
      },
    });
  } catch (error) {
    console.error('Delta error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔄 POST /api/sync/import - Importar mudanças do cliente offline
 * Quando volta online, sincroniza mudanças locais
 */
router.post('/import', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { changes } = req.body;

    if (!changes) {
      return res.status(400).json({ error: 'Campo "changes" obrigatório' });
    }

    const results = {
      imported: 0,
      conflicts: 0,
      errors: 0,
    };

    // Importar clientes
    if (changes.clients) {
      for (const client of changes.clients) {
        try {
          const existing = await get(
            'SELECT * FROM clients WHERE id = ? AND tenant_id = ?',
            [client.id, tenantId]
          );

          if (existing) {
            // Verificar se versão remota é mais recente
            if (new Date(client.updated_at) > new Date(existing.updated_at)) {
              // Atualizar
              await run(
                `UPDATE clients SET
                  name = ?, contact = ?, phone = ?, email = ?,
                  address_street = ?, address_number = ?, address_complement = ?,
                  address_city = ?, address_state = ?, address_zipcode = ?, address_country = ?,
                  primary_color = ?, notes = ?, updated_at = ?
                 WHERE id = ?`,
                [
                  client.name, client.contact, client.phone, client.email,
                  client.address?.street, client.address?.number, client.address?.complement,
                  client.address?.city, client.address?.state, client.address?.zipCode,
                  client.address?.country, client.primaryColor, client.notes,
                  client.updated_at, client.id
                ]
              );
              results.imported++;
            } else {
              results.conflicts++;
            }
          } else {
            // Inserir novo
            const now = new Date().toISOString();
            await run(
              `INSERT INTO clients (
                id, tenant_id, name, contact, phone, email,
                address_street, address_number, address_complement,
                address_city, address_state, address_zipcode, address_country,
                primary_color, notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                client.id, tenantId, client.name, client.contact, client.phone, client.email,
                client.address?.street, client.address?.number, client.address?.complement,
                client.address?.city, client.address?.state, client.address?.zipCode,
                client.address?.country, client.primaryColor, client.notes, now, now
              ]
            );
            results.imported++;
          }
        } catch (error) {
          console.error('Client import error:', error);
          results.errors++;
        }
      }
    }

    // Importar materiais (processo similar)
    if (changes.materials) {
      for (const material of changes.materials) {
        try {
          const existing = await get(
            'SELECT * FROM materials WHERE id = ? AND tenant_id = ?',
            [material.id, tenantId]
          );

          if (existing) {
            if (new Date(material.updated_at) > new Date(existing.updated_at)) {
              await run(
                `UPDATE materials SET
                  name = ?, density = ?, cost_price = ?, sell_price = ?, base_price = ?, updated_at = ?
                 WHERE id = ?`,
                [material.name, material.density, material.costPrice, material.sellPrice, material.basePrice, material.updated_at, material.id]
              );
              results.imported++;
            } else {
              results.conflicts++;
            }
          } else {
            const now = new Date().toISOString();
            await run(
              `INSERT INTO materials (id, tenant_id, name, density, cost_price, sell_price, base_price, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [material.id, tenantId, material.name, material.density, material.costPrice, material.sellPrice, material.basePrice, now, now]
            );
            results.imported++;
          }
        } catch (error) {
          console.error('Material import error:', error);
          results.errors++;
        }
      }
    }

    res.json({
      ok: true,
      results,
      message: `Sincronizado: ${results.imported} inserções/atualizações, ${results.conflicts} conflitos, ${results.errors} erros`,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
