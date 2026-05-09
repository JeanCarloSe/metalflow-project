/**
 * 🚀 MetalFlow API Worker - Cloudflare D1
 * Servidores serverless global com banco de dados integrado
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: 'D1'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // API Routes
      if (path.startsWith('/api/clients')) {
        return handleClients(request, env, path);
      }

      if (path.startsWith('/api/quotations')) {
        return handleQuotations(request, env, path);
      }

      if (path.startsWith('/api/materials')) {
        return handleMaterials(request, env, path);
      }

      if (path.startsWith('/api/sync')) {
        return handleSync(request, env, path);
      }

      // 404
      return new Response(JSON.stringify({
        error: 'Route not found',
        path: path
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message,
        status: 'error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// Handlers
async function handleClients(request, env, path) {
  const db = env.DB;
  const tenantId = 'default-tenant'; // TODO: Get from auth

  if (request.method === 'GET') {
    // GET /api/clients
    const clients = await db.prepare(
      'SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC'
    ).bind(tenantId).all();

    return new Response(JSON.stringify(clients.results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    // POST /api/clients - Create new client
    const body = await request.json();
    const id = crypto.randomUUID();

    await db.prepare(
      `INSERT INTO clients (id, tenant_id, name, contact, phone, email,
       address_street, address_number, address_city, address_state, address_zip, primary_color, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, tenantId, body.name, body.contact, body.phone, body.email,
      body.address_street, body.address_number, body.address_city,
      body.address_state, body.address_zip, body.primary_color, body.notes
    ).run();

    return new Response(JSON.stringify({ id, ...body }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleQuotations(request, env, path) {
  const db = env.DB;
  const tenantId = 'default-tenant';

  if (request.method === 'GET') {
    const quotations = await db.prepare(
      'SELECT * FROM quotations WHERE tenant_id = ? ORDER BY date DESC'
    ).bind(tenantId).all();

    return new Response(JSON.stringify(quotations.results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = crypto.randomUUID();

    await db.prepare(
      `INSERT INTO quotations (id, tenant_id, client_id, number, date, status,
       total_price, total_weight, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, tenantId, body.client_id, body.number, body.date,
      body.status || 'draft', body.total_price || 0, body.total_weight || 0, body.notes
    ).run();

    return new Response(JSON.stringify({ id, ...body }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMaterials(request, env, path) {
  const db = env.DB;
  const tenantId = 'default-tenant';

  if (request.method === 'GET') {
    const materials = await db.prepare(
      'SELECT * FROM materials WHERE tenant_id = ? ORDER BY name ASC'
    ).bind(tenantId).all();

    return new Response(JSON.stringify(materials.results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = crypto.randomUUID();

    await db.prepare(
      `INSERT INTO materials (id, tenant_id, name, density, cost_price, sell_price, base_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, tenantId, body.name, body.density, body.cost_price, body.sell_price, body.base_price
    ).run();

    return new Response(JSON.stringify({ id, ...body }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleSync(request, env, path) {
  const db = env.DB;
  const tenantId = 'default-tenant';

  if (path === '/api/sync/snapshot') {
    // Complete data sync
    const clients = await db.prepare('SELECT * FROM clients WHERE tenant_id = ?').bind(tenantId).all();
    const materials = await db.prepare('SELECT * FROM materials WHERE tenant_id = ?').bind(tenantId).all();
    const quotations = await db.prepare('SELECT * FROM quotations WHERE tenant_id = ?').bind(tenantId).all();
    const lines = await db.prepare('SELECT * FROM quotation_lines').all();

    return new Response(JSON.stringify({
      clients: clients.results,
      materials: materials.results,
      quotations: quotations.results,
      lines: lines.results,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
