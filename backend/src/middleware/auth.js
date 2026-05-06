import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * 🔐 Gerar JWT token
 */
export function generateToken(userId, tenantId) {
  return jwt.sign(
    { userId, tenantId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * 🔐 Verificar token e extrair dados
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * 🔐 Middleware: Validar autenticação (JWT via cookie)
 */
export function authenticate(req, res, next) {
  try {
    const token = req.cookies.metalflow_token;

    if (!token) {
      return res.status(401).json({ error: 'Token não encontrado' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Autenticação falhou' });
  }
}

/**
 * 🔐 Middleware: Validar multi-tenant (isolar dados por tenant)
 */
export function validateTenant(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  req.tenantId = req.user.tenantId;
  next();
}

/**
 * 🔐 Middleware: Validar propriedade do recurso
 */
export function validateOwnership(req, res, next) {
  const { tenantId } = req.query;

  if (tenantId && tenantId !== req.tenantId) {
    return res.status(403).json({ error: 'Acesso não autorizado a este tenant' });
  }

  next();
}
