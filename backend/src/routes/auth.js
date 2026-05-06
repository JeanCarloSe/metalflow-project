import express from 'express';
import { v4 as uuid } from 'uuid';
import { run, get } from '../db/database.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * 🔐 POST /api/auth/register - Registrar novo usuário
 */
router.post('/register', async (req, res) => {
  try {
    const { login, email, name, password, tenantId } = req.body;

    if (!login || !email || !name || !password || !tenantId) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const userId = uuid();

    // Hash simplificado (em produção usar bcrypt)
    const passwordHash = Buffer.from(password).toString('base64');

    await run(
      `INSERT INTO users (id, tenant_id, login, email, name, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, 'user')`,
      [userId, tenantId, login, email, name, passwordHash]
    );

    const token = generateToken(userId, tenantId);

    res.cookie('metalflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      ok: true,
      user: { id: userId, login, email, name, role: 'user' },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Login ou email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔐 POST /api/auth/login - Fazer login
 */
router.post('/login', async (req, res) => {
  try {
    const { login, password, tenantId } = req.body;

    if (!login || !password || !tenantId) {
      return res.status(400).json({ error: 'Login e senha obrigatórios' });
    }

    const user = await get(
      'SELECT * FROM users WHERE login = ? AND tenant_id = ?',
      [login, tenantId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha (simplificado)
    const passwordHash = Buffer.from(password).toString('base64');
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id, user.tenant_id);

    res.cookie('metalflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔐 POST /api/auth/logout - Fazer logout
 */
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('metalflow_token');
  res.json({ ok: true });
});

/**
 * 🔐 GET /api/auth/me - Obter usuário autenticado
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, login, email, name, role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
