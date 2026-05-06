import express from 'express';
import { v4 as uuid } from 'uuid';
import { query, run, get } from '../db/database.js';
import { authenticate, validateTenant } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(validateTenant);

/**
 * 📊 GET /api/quotations - Listar orçamentos
 */
router.get('/', async (req, res) => {
  try {
    const { skip = 0, take = 100, clientId, status } = req.query;
    const tenantId = req.tenantId;

    let sql = `SELECT * FROM quotations WHERE tenant_id = ?`;
    let params = [tenantId];

    if (clientId) {
      sql += ` AND client_id = ?`;
      params.push(clientId);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(take), parseInt(skip));

    const quotations = await query(sql, params);

    const countResult = await get(
      'SELECT COUNT(*) as count FROM quotations WHERE tenant_id = ?',
      [tenantId]
    );

    res.json({
      ok: true,
      data: quotations,
      total: countResult.count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 GET /api/quotations/:id - Obter orçamento com linhas
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const quotation = await get(
      'SELECT * FROM quotations WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    const lines = await query(
      'SELECT * FROM quotation_lines WHERE quotation_id = ?',
      [id]
    );

    res.json({ ok: true, data: { ...quotation, lines } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 POST /api/quotations - Criar novo orçamento
 */
router.post('/', async (req, res) => {
  try {
    const { clientId, number, date, status = 'em-andamento', lines = [], notes } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user.userId;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId obrigatório' });
    }

    const id = uuid();
    const now = new Date().toISOString();

    // Calcular totais
    const totalPrice = lines.reduce((sum, line) => sum + (parseFloat(line.totalPrice) || 0), 0);
    const totalWeight = lines.reduce((sum, line) => sum + (parseFloat(line.weightKg) || 0), 0);

    // Inserir orçamento
    await run(
      `INSERT INTO quotations (
        id, tenant_id, client_id, number, date, status,
        total_price, total_weight, operator_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tenantId, clientId, number, date, status, totalPrice, totalWeight, userId, notes, now, now]
    );

    // Inserir linhas
    for (const line of lines) {
      const lineId = uuid();
      await run(
        `INSERT INTO quotation_lines (
          id, quotation_id, material_id, name, quantity, weight_kg,
          cost_price, sell_price, total_cost, total_price, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lineId, id, line.materialId, line.name, line.quantity, line.weightKg,
          line.costPrice, line.sellPrice, line.totalCost, line.totalPrice, now, now
        ]
      );
    }

    const newQuotation = await get('SELECT * FROM quotations WHERE id = ?', [id]);
    const newLines = await query('SELECT * FROM quotation_lines WHERE quotation_id = ?', [id]);

    res.status(201).json({
      ok: true,
      data: { ...newQuotation, lines: newLines }
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 PUT /api/quotations/:id - Atualizar orçamento
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, number, date, status, notes, lines = [] } = req.body;
    const tenantId = req.tenantId;

    const now = new Date().toISOString();

    // Calcular totais
    const totalPrice = lines.reduce((sum, line) => sum + (parseFloat(line.totalPrice) || 0), 0);
    const totalWeight = lines.reduce((sum, line) => sum + (parseFloat(line.weightKg) || 0), 0);

    // Atualizar orçamento
    await run(
      `UPDATE quotations SET
        client_id = ?, number = ?, date = ?, status = ?,
        total_price = ?, total_weight = ?, notes = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
      [clientId, number, date, status, totalPrice, totalWeight, notes, now, id, tenantId]
    );

    // Remover linhas antigas
    await run('DELETE FROM quotation_lines WHERE quotation_id = ?', [id]);

    // Inserir linhas novas
    for (const line of lines) {
      const lineId = line.id || uuid();
      await run(
        `INSERT INTO quotation_lines (
          id, quotation_id, material_id, name, quantity, weight_kg,
          cost_price, sell_price, total_cost, total_price, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lineId, id, line.materialId, line.name, line.quantity, line.weightKg,
          line.costPrice, line.sellPrice, line.totalCost, line.totalPrice, now, now
        ]
      );
    }

    const updatedQuotation = await get('SELECT * FROM quotations WHERE id = ?', [id]);
    const updatedLines = await query('SELECT * FROM quotation_lines WHERE quotation_id = ?', [id]);

    res.json({ ok: true, data: { ...updatedQuotation, lines: updatedLines } });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
