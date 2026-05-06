import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initDB } from './db/database.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import quotationRoutes from './routes/quotations.js';
import materialRoutes from './routes/materials.js';
import syncRoutes from './routes/sync.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/sync', syncRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize and start
(async () => {
  try {
    console.log('🚀 Inicializando MetalFlow Backend...');
    await initDB();
    console.log('✅ Database inicializado');

    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║                                               ║');
      console.log(`║  🎯 MetalFlow Backend rodando em porta ${PORT}      ║`);
      console.log('║  📍 http://localhost:3000/api                ║');
      console.log('║  ✅ Database: SQLite                          ║');
      console.log('║                                               ║');
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Falha ao inicializar:', error);
    process.exit(1);
  }
})();
