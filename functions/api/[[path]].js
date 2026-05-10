export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (path === '/health' || path === '/api/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString(), database: 'D1' }, 200, corsHeaders);
    }

    if (path.startsWith('/api/auth'))       return handleAuth(request, env, path, corsHeaders);
    if (path.startsWith('/api/users'))      return handleUsers(request, env, path, corsHeaders);
    if (path.startsWith('/api/services'))   return handleServices(request, env, path, corsHeaders);
    if (path.startsWith('/api/clients'))    return handleClients(request, env, path, corsHeaders);
    if (path.startsWith('/api/quotations')) return handleQuotations(request, env, path, corsHeaders);
    if (path.startsWith('/api/materials'))  return handleMaterials(request, env, path, corsHeaders);
    if (path.startsWith('/api/sync'))       return handleSync(request, env, path, corsHeaders);

    return json({ error: 'Route not found', path }, 404, corsHeaders);
  } catch (error) {
    return json({ error: error.message }, 500, corsHeaders);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// snake_case → camelCase converters
function clientToApi(row) {
  if (!row) return null;
  return {
    id:           row.id,
    name:         row.name,
    contact:      row.contact,
    phone:        row.phone,
    email:        row.email,
    primaryColor: row.primary_color,
    notes:        row.notes,
    addressStreet: row.address_street,
    addressNumber: row.address_number,
    addressCity:   row.address_city,
    addressState:  row.address_state,
    addressZip:    row.address_zip,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

function quotationToApi(row, lines = [], clientName = null) {
  if (!row) return null;
  return {
    id:          row.id,
    clientId:    row.client_id,
    clientName:  clientName || row.client_name || null,
    number:      row.number,
    date:        row.date,
    status:      row.status,
    totalPrice:  row.total_price,
    totalWeight: row.total_weight,
    notes:       row.notes,
    operatorId:  row.operator_id,
    createdBy:   row.operator_id,
    lines:       lines,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function materialToApi(row) {
  if (!row) return null;
  return {
    id:        row.id,
    name:      row.name,
    density:   row.density,
    costPrice: row.cost_price,
    sellPrice: row.sell_price,
    basePrice: row.base_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function lineToApi(row) {
  if (!row) return null;
  return {
    id:          row.id,
    quotationId: row.quotation_id,
    materialId:  row.material_id,
    name:        row.name,
    quantity:    row.quantity,
    weightKg:    row.weight_kg,
    lengthMm:    row.length_mm,
    widthMm:     row.width_mm,
    thicknessMm: row.thickness_mm,
    services:    row.services ? JSON.parse(row.services) : [],
    costPrice:   row.cost_price,
    sellPrice:   row.sell_price,
    totalCost:   row.total_cost,
    totalPrice:  row.total_price,
  };
}

const TENANT = 'default-tenant';

// ── Clients ───────────────────────────────────────────────────────────────────

async function handleClients(request, env, path, cors) {
  const db = env.DB;

  if (request.method === 'GET') {
    const rows = await db.prepare(
      'SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC'
    ).bind(TENANT).all();
    return json(rows.results.map(clientToApi), 200, cors);
  }

  if (request.method === 'POST') {
    try {
      const b = await request.json();
      const id = b.id || crypto.randomUUID();
      await db.prepare(
        `INSERT INTO clients (id, tenant_id, name, contact, phone, email,
         address_street, address_number, address_city, address_state, address_zip, primary_color, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, TENANT,
        b.name || '',
        b.contact || null,
        b.phone || null,
        b.email || null,
        b.address_street || b.addressStreet || null,
        b.address_number || b.addressNumber || null,
        b.address_city   || b.addressCity   || null,
        b.address_state  || b.addressState  || null,
        b.address_zip    || b.addressZip    || null,
        b.primary_color  || b.primaryColor  || null,
        b.notes || null
      ).run();
      const row = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first();
      return json(clientToApi(row), 201, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'PUT') {
    try {
      const id = path.split('/').pop();
      const b = await request.json();
      await db.prepare(
        `UPDATE clients SET name=?, contact=?, phone=?, email=?,
         address_street=?, address_number=?, address_city=?, address_state=?,
         address_zip=?, primary_color=?, notes=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND tenant_id=?`
      ).bind(
        b.name || '',
        b.contact || null,
        b.phone || null,
        b.email || null,
        b.address_street || b.addressStreet || null,
        b.address_number || b.addressNumber || null,
        b.address_city   || b.addressCity   || null,
        b.address_state  || b.addressState  || null,
        b.address_zip    || b.addressZip    || null,
        b.primary_color  || b.primaryColor  || null,
        b.notes || null,
        id, TENANT
      ).run();
      const row = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first();
      return json(clientToApi(row), 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM clients WHERE id=? AND tenant_id=?').bind(id, TENANT).run();
      return json({ success: true }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }
}

// ── Quotations ────────────────────────────────────────────────────────────────

async function handleQuotations(request, env, path, cors) {
  const db = env.DB;

  // GET /api/quotations or /api/quotations/:id
  if (request.method === 'GET') {
    const parts = path.split('/').filter(Boolean);
    // /api/quotations/:id/lines
    if (parts.length === 4 && parts[3] === 'lines') {
      const quotationId = parts[2];
      const rows = await db.prepare(
        'SELECT * FROM quotation_lines WHERE quotation_id = ?'
      ).bind(quotationId).all();
      return json(rows.results.map(lineToApi), 200, cors);
    }

    const rows = await db.prepare(
      `SELECT q.*, c.name as client_name
       FROM quotations q
       LEFT JOIN clients c ON q.client_id = c.id
       WHERE q.tenant_id = ?
       ORDER BY q.created_at DESC`
    ).bind(TENANT).all();

    // Embed lines for each quotation
    const quotations = await Promise.all(rows.results.map(async (q) => {
      const lineRows = await db.prepare(
        'SELECT * FROM quotation_lines WHERE quotation_id = ?'
      ).bind(q.id).all();
      return quotationToApi(q, lineRows.results.map(lineToApi), q.client_name);
    }));

    return json(quotations, 200, cors);
  }

  if (request.method === 'POST') {
    try {
      const b = await request.json();
      const id = b.id || crypto.randomUUID();
      const clientId = b.client_id || b.clientId || null;
      const dateVal  = b.date || today();
      const number   = b.number || `ORC-${Date.now()}`;

      // Ensure client exists if clientId provided (FK constraint)
      if (clientId) {
        const clientExists = await db.prepare(
          'SELECT id FROM clients WHERE id = ?'
        ).bind(clientId).first();
        if (!clientExists) {
          return json({ error: `Cliente com id "${clientId}" não encontrado. Crie o cliente primeiro.` }, 400, cors);
        }
      }

      const operatorId = b.operatorId || b.createdBy || (b.operator?.id) || null;

      await db.prepare(
        `INSERT INTO quotations (id, tenant_id, client_id, number, date, status,
         total_price, total_weight, notes, operator_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, TENANT,
        clientId,
        number,
        dateVal,
        b.status || 'draft',
        b.total_price || b.totalPrice || 0,
        b.total_weight || b.totalWeight || 0,
        b.notes || null,
        operatorId
      ).run();

      // Save lines if provided
      const lines = b.lines || [];
      for (const line of lines) {
        const lineId = line.id || crypto.randomUUID();
        const materialId = line.materialId || line.material_id || null;

        // Verify material exists if materialId provided
        let matOk = true;
        if (materialId) {
          const matExists = await db.prepare('SELECT id FROM materials WHERE id = ?').bind(materialId).first();
          if (!matExists) matOk = false;
        }

        if (matOk && materialId) {
          await db.prepare(
            `INSERT OR REPLACE INTO quotation_lines
             (id, quotation_id, material_id, name, quantity, weight_kg,
              length_mm, width_mm, thickness_mm, services,
              cost_price, sell_price, total_cost, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            lineId, id, materialId,
            line.name || '',
            line.quantity || 1,
            line.weightKg || line.weight_kg || 0,
            line.lengthMm || line.length_mm || null,
            line.widthMm  || line.width_mm  || null,
            line.thicknessMm || line.thickness_mm || null,
            JSON.stringify(line.services || []),
            line.costPrice || line.cost_price || 0,
            line.sellPrice || line.sell_price || 0,
            line.totalCost || line.total_cost || 0,
            line.totalPrice || line.total_price || 0
          ).run();
        }
      }

      const row = await db.prepare('SELECT * FROM quotations WHERE id = ?').bind(id).first();
      const lineRows = await db.prepare('SELECT * FROM quotation_lines WHERE quotation_id = ?').bind(id).all();
      return json(quotationToApi(row, lineRows.results.map(lineToApi)), 201, cors);
    } catch (err) {
      return json({ error: err.message, details: err.toString() }, 400, cors);
    }
  }

  if (request.method === 'PUT') {
    try {
      const id = path.split('/').pop();
      const b = await request.json();
      const clientId = b.client_id || b.clientId || null;
      const dateVal  = b.date || today();

      const operatorIdUpd = b.operatorId || b.createdBy || (b.operator?.id) || null;

      await db.prepare(
        `UPDATE quotations SET client_id=?, number=?, date=?, status=?,
         total_price=?, total_weight=?, notes=?,
         operator_id=COALESCE(?, operator_id),
         updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND tenant_id=?`
      ).bind(
        clientId,
        b.number || null,
        dateVal,
        b.status || 'draft',
        b.total_price || b.totalPrice || 0,
        b.total_weight || b.totalWeight || 0,
        b.notes || null,
        operatorIdUpd,
        id, TENANT
      ).run();

      // Replace lines
      const lines = b.lines;
      if (Array.isArray(lines)) {
        await db.prepare('DELETE FROM quotation_lines WHERE quotation_id = ?').bind(id).run();
        for (const line of lines) {
          const lineId = line.id || crypto.randomUUID();
          const materialId = line.materialId || line.material_id || null;
          let matOk = true;
          if (materialId) {
            const matExists = await db.prepare('SELECT id FROM materials WHERE id = ?').bind(materialId).first();
            if (!matExists) matOk = false;
          }
          if (matOk && materialId) {
            await db.prepare(
              `INSERT OR REPLACE INTO quotation_lines
               (id, quotation_id, material_id, name, quantity, weight_kg,
                length_mm, width_mm, thickness_mm, services,
                cost_price, sell_price, total_cost, total_price)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              lineId, id, materialId,
              line.name || '',
              line.quantity || 1,
              line.weightKg || line.weight_kg || 0,
              line.lengthMm || line.length_mm || null,
              line.widthMm  || line.width_mm  || null,
              line.thicknessMm || line.thickness_mm || null,
              JSON.stringify(line.services || []),
              line.costPrice || line.cost_price || 0,
              line.sellPrice || line.sell_price || 0,
              line.totalCost || line.total_cost || 0,
              line.totalPrice || line.total_price || 0
            ).run();
          }
        }
      }

      const row = await db.prepare('SELECT * FROM quotations WHERE id = ?').bind(id).first();
      const lineRows = await db.prepare('SELECT * FROM quotation_lines WHERE quotation_id = ?').bind(id).all();
      return json(quotationToApi(row, lineRows.results.map(lineToApi)), 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM quotation_lines WHERE quotation_id = ?').bind(id).run();
      await db.prepare('DELETE FROM quotations WHERE id=? AND tenant_id=?').bind(id, TENANT).run();
      return json({ success: true }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }
}

// ── Materials ─────────────────────────────────────────────────────────────────

async function handleMaterials(request, env, path, cors) {
  const db = env.DB;

  if (request.method === 'GET') {
    const rows = await db.prepare(
      'SELECT * FROM materials WHERE tenant_id = ? ORDER BY name ASC'
    ).bind(TENANT).all();
    return json(rows.results.map(materialToApi), 200, cors);
  }

  if (request.method === 'POST') {
    try {
      const b = await request.json();
      const id = b.id || crypto.randomUUID();
      await db.prepare(
        `INSERT INTO materials (id, tenant_id, name, density, cost_price, sell_price, base_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, TENANT,
        b.name || '',
        b.density || 0,
        b.cost_price || b.costPrice || 0,
        b.sell_price || b.sellPrice || 0,
        b.base_price || b.basePrice || b.sell_price || b.sellPrice || 0
      ).run();
      const row = await db.prepare('SELECT * FROM materials WHERE id = ?').bind(id).first();
      return json(materialToApi(row), 201, cors);
    } catch (err) {
      return json({ error: err.message, details: err.toString() }, 400, cors);
    }
  }

  if (request.method === 'PUT') {
    try {
      const id = path.split('/').pop();
      const b = await request.json();
      await db.prepare(
        `UPDATE materials SET name=?, density=?, cost_price=?, sell_price=?, base_price=?,
         updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND tenant_id=?`
      ).bind(
        b.name || '',
        b.density || 0,
        b.cost_price || b.costPrice || 0,
        b.sell_price || b.sellPrice || 0,
        b.base_price || b.basePrice || b.sell_price || b.sellPrice || 0,
        id, TENANT
      ).run();
      const row = await db.prepare('SELECT * FROM materials WHERE id = ?').bind(id).first();
      return json(materialToApi(row), 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM materials WHERE id=? AND tenant_id=?').bind(id, TENANT).run();
      return json({ success: true }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }
}

// ── Sync ──────────────────────────────────────────────────────────────────────

async function handleSync(request, env, path, cors) {
  const db = env.DB;

  if (path === '/api/sync/snapshot') {
    const [clients, materials, quotations, lines] = await Promise.all([
      db.prepare('SELECT * FROM clients WHERE tenant_id = ?').bind(TENANT).all(),
      db.prepare('SELECT * FROM materials WHERE tenant_id = ?').bind(TENANT).all(),
      db.prepare('SELECT * FROM quotations WHERE tenant_id = ?').bind(TENANT).all(),
      db.prepare('SELECT * FROM quotation_lines').all(),
    ]);
    return json({
      clients:    clients.results.map(clientToApi),
      materials:  materials.results.map(materialToApi),
      quotations: quotations.results.map(q => quotationToApi(q)),
      lines:      lines.results.map(lineToApi),
      timestamp:  new Date().toISOString(),
    }, 200, cors);
  }

  return json({ error: 'Sync route not found' }, 404, cors);
}

// ── Services ──────────────────────────────────────────────────────────────────

function serviceToApi(row) {
  if (!row) return null;
  return {
    id:            row.id,
    name:          row.name,
    costPerKg:     row.cost_per_kg,
    sellPrice:     row.sell_price,
    marginPercent: row.margin_percent,
    description:   row.description,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

async function handleServices(request, env, path, cors) {
  const db = env.DB;

  if (request.method === 'GET') {
    const rows = await db.prepare(
      'SELECT * FROM services WHERE tenant_id = ? ORDER BY name ASC'
    ).bind(TENANT).all();
    return json(rows.results.map(serviceToApi), 200, cors);
  }

  if (request.method === 'POST') {
    try {
      const b = await request.json();
      if (!b.name) return json({ error: 'Nome é obrigatório' }, 400, cors);
      const exists = await db.prepare('SELECT id FROM services WHERE name = ? AND tenant_id = ?').bind(b.name, TENANT).first();
      if (exists) return json({ error: 'Serviço já existe' }, 409, cors);
      const id = b.id || b.name.toLowerCase().replace(/\s+/g, '-');
      const cost = parseFloat(b.costPerKg || b.cost_per_kg || 0);
      const sell = parseFloat(b.sellPrice || b.sell_price || cost * 1.2);
      const margin = parseFloat(b.marginPercent || b.margin_percent || 20);
      await db.prepare(
        `INSERT INTO services (id, tenant_id, name, cost_per_kg, sell_price, margin_percent, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, TENANT, b.name, cost, sell, margin, b.description || null).run();
      const row = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
      return json(serviceToApi(row), 201, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'PUT') {
    try {
      const id = path.split('/').pop();
      const b = await request.json();
      const cost = parseFloat(b.costPerKg || b.cost_per_kg || 0);
      const sell = parseFloat(b.sellPrice || b.sell_price || cost * 1.2);
      const margin = parseFloat(b.marginPercent || b.margin_percent || 20);
      await db.prepare(
        `UPDATE services SET name=?, cost_per_kg=?, sell_price=?, margin_percent=?, description=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=? AND tenant_id=?`
      ).bind(b.name || '', cost, sell, margin, b.description || null, id, TENANT).run();
      const row = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
      return json(serviceToApi(row), 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM services WHERE id=? AND tenant_id=?').bind(id, TENANT).run();
      return json({ success: true }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function userToApi(row) {
  if (!row) return null;
  return {
    id:        row.id,
    login:     row.login,
    name:      row.name,
    email:     row.email,
    role:      row.role,
    tenantId:  row.tenant_id,
    createdAt: row.created_at,
  };
}

async function ensureAdminExists(db) {
  const admin = await db.prepare("SELECT id FROM users WHERE login = 'admin'").first();
  if (!admin) {
    const hash = await hashPassword('123456');
    await db.prepare(
      `INSERT INTO users (id, tenant_id, login, email, name, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind('user-admin', TENANT, 'admin', 'admin@metalflow.local', 'Administrador', hash, 'admin').run();
  }
}

async function handleAuth(request, env, path, cors) {
  const db = env.DB;
  await ensureAdminExists(db);

  // POST /api/auth/login
  if (path === '/api/auth/login' && request.method === 'POST') {
    try {
      const { login, password } = await request.json();
      if (!login || !password) return json({ error: 'Login e senha obrigatórios' }, 400, cors);

      const hash = await hashPassword(password);
      const user = await db.prepare(
        'SELECT * FROM users WHERE login = ? AND password_hash = ?'
      ).bind(login.toLowerCase().trim(), hash).first();

      if (!user) return json({ error: 'Usuário ou senha inválidos' }, 401, cors);

      return json({ ok: true, user: userToApi(user) }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  // POST /api/auth/register
  if (path === '/api/auth/register' && request.method === 'POST') {
    try {
      const { login, password, name, email, role } = await request.json();
      if (!login || !password || !name) return json({ error: 'login, senha e nome são obrigatórios' }, 400, cors);

      const exists = await db.prepare('SELECT id FROM users WHERE login = ?').bind(login.toLowerCase().trim()).first();
      if (exists) return json({ error: 'Login já está em uso' }, 409, cors);

      const hash = await hashPassword(password);
      const id = `user-${crypto.randomUUID()}`;
      await db.prepare(
        `INSERT INTO users (id, tenant_id, login, email, name, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, TENANT, login.toLowerCase().trim(), email || `${login}@metalflow.local`, name, hash, role || 'operator').run();

      const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      return json({ ok: true, user: userToApi(user) }, 201, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  // POST /api/auth/logout
  if (path === '/api/auth/logout' && request.method === 'POST') {
    return json({ ok: true }, 200, cors);
  }

  return json({ error: 'Auth route not found' }, 404, cors);
}

// ── Users (admin only) ────────────────────────────────────────────────────────

async function handleUsers(request, env, path, cors) {
  const db = env.DB;
  await ensureAdminExists(db);

  if (request.method === 'GET') {
    const rows = await db.prepare(
      'SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC'
    ).bind(TENANT).all();
    return json(rows.results.map(userToApi), 200, cors);
  }

  if (request.method === 'POST') {
    try {
      const { login, password, name, email, role, number } = await request.json();
      if (!login || !password || !name) return json({ error: 'login, senha e nome são obrigatórios' }, 400, cors);

      const exists = await db.prepare('SELECT id FROM users WHERE login = ?').bind(login.toLowerCase().trim()).first();
      if (exists) return json({ error: 'Login já está em uso' }, 409, cors);

      const hash = await hashPassword(password);
      const id = `user-${crypto.randomUUID()}`;
      await db.prepare(
        `INSERT INTO users (id, tenant_id, login, email, name, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, TENANT, login.toLowerCase().trim(), email || `${login}@metalflow.local`, name, hash, role || 'operator').run();

      const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      return json(userToApi(user), 201, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const id = path.split('/').pop();
      if (id === 'user-admin') return json({ error: 'Não é possível deletar o admin padrão' }, 403, cors);
      await db.prepare('DELETE FROM users WHERE id = ? AND tenant_id = ?').bind(id, TENANT).run();
      return json({ success: true }, 200, cors);
    } catch (err) {
      return json({ error: err.message }, 400, cors);
    }
  }
}
