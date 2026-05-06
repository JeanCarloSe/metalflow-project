import express from 'express';
import { v4 as uuid } from 'uuid';
import { query, run, get } from '../db/database.js';
import { authenticate, validateTenant } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(validateTenant);

/**
 * 🏭 GET /api/materials - Listar materiais
 */
router.get('/', async (req, res) => {
  try {
    const { skip = 0, take = 100 } = req.query;
    const tenantId = req.tenantId;

    const materials = await query(
      `SELECT * FROM materials WHERE tenant_id = ? ORDER BY name LIMIT ? OFFSET ?`,
      [tenantId, parseInt(take), parseInt(skip)]
    );

    const countResult = await get(
      'SELECT COUNT(*) as count FROM materials WHERE tenant_id = ?',
      [tenantId]
    );

    res.json({ ok: true, data: materials, total: countResult.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🏭 POST /api/materials - Criar material
 */
router.post('/', async (req, res) => {
  try {
    const { name, density, costPrice, sellPrice, basePrice } = req.body;
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({ error: 'Nome obrigatório' });
    }

    const id = uuid();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO materials (id, tenant_id, name, density, cost_price, sell_price, base_price, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tenantId, name, density, costPrice, sellPrice, basePrice, now, now]
    );

    const newMaterial = await get('SELECT * FROM materials WHERE id = ?', [id]);
    res.status(201).json({ ok: true, data: newMaterial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🏭 PUT /api/materials/:id - Atualizar material
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, density, costPrice, sellPrice, basePrice } = req.body;
    const tenantId = req.tenantId;
    const now = new Date().toISOString();

    await run(
      `UPDATE materials SET name = ?, density = ?, cost_price = ?, sell_price = ?, base_price = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
      [name, density, costPrice, sellPrice, basePrice, now, id, tenantId]
    );

    const updated = await get('SELECT * FROM materials WHERE id = ?', [id]);
    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
