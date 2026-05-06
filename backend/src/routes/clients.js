import express from 'express';
import { v4 as uuid } from 'uuid';
import { query, run, get } from '../db/database.js';
import { authenticate, validateTenant } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(authenticate);
router.use(validateTenant);

/**
 * 📋 GET /api/clients - Listar clientes
 */
router.get('/', async (req, res) => {
  try {
    const { skip = 0, take = 100 } = req.query;
    const tenantId = req.tenantId;

    const clients = await query(
      `SELECT * FROM clients
       WHERE tenant_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [tenantId, parseInt(take), parseInt(skip)]
    );

    const countResult = await get(
      'SELECT COUNT(*) as count FROM clients WHERE tenant_id = ?',
      [tenantId]
    );

    res.json({
      ok: true,
      data: clients,
      total: countResult.count,
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📋 GET /api/clients/:id - Obter cliente por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const client = await get(
      'SELECT * FROM clients WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ ok: true, data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📋 POST /api/clients - Criar novo cliente
 */
router.post('/', async (req, res) => {
  try {
    const { name, contact, phone, email, address, primaryColor, notes } = req.body;
    const tenantId = req.tenantId;

    if (!name) {
      return res.status(400).json({ error: 'Nome do cliente obrigatório' });
    }

    const id = uuid();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO clients (
        id, tenant_id, name, contact, phone, email,
        address_street, address_number, address_complement,
        address_city, address_state, address_zipcode, address_country,
        primary_color, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, tenantId, name, contact, phone, email,
        address?.street, address?.number, address?.complement,
        address?.city, address?.state, address?.zipCode, address?.country,
        primaryColor, notes, now, now
      ]
    );

    const newClient = await get('SELECT * FROM clients WHERE id = ?', [id]);

    res.status(201).json({ ok: true, data: newClient });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📋 PUT /api/clients/:id - Atualizar cliente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, address, primaryColor, notes } = req.body;
    const tenantId = req.tenantId;

    const now = new Date().toISOString();

    await run(
      `UPDATE clients SET
        name = ?, contact = ?, phone = ?, email = ?,
        address_street = ?, address_number = ?, address_complement = ?,
        address_city = ?, address_state = ?, address_zipcode = ?, address_country = ?,
        primary_color = ?, notes = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
      [
        name, contact, phone, email,
        address?.street, address?.number, address?.complement,
        address?.city, address?.state, address?.zipCode, address?.country,
        primaryColor, notes, now, id, tenantId
      ]
    );

    const updatedClient = await get('SELECT * FROM clients WHERE id = ?', [id]);

    res.json({ ok: true, data: updatedClient });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📋 DELETE /api/clients/:id - Deletar cliente
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    await run(
      'DELETE FROM clients WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
