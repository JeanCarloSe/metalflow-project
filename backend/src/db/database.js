import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/metalflow.db');

let db = null;

/**
 * 🗄️ Obter conexão com banco de dados
 */
export function getDB() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao SQLite:', err);
        process.exit(1);
      }
      console.log('✅ Conectado ao SQLite');
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

/**
 * 🗄️ Inicializar banco de dados e criar tabelas
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          login TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de clientes
      db.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          contact TEXT,
          phone TEXT,
          email TEXT,
          address_street TEXT,
          address_number TEXT,
          address_complement TEXT,
          address_city TEXT,
          address_state TEXT,
          address_zipcode TEXT,
          address_country TEXT,
          primary_color TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced_at DATETIME,
          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        )
      `);

      // Tabela de materiais
      db.run(`
        CREATE TABLE IF NOT EXISTS materials (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          density REAL,
          cost_price REAL NOT NULL,
          sell_price REAL NOT NULL,
          base_price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced_at DATETIME,
          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        )
      `);

      // Tabela de orçamentos
      db.run(`
        CREATE TABLE IF NOT EXISTS quotations (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          client_id TEXT NOT NULL,
          number TEXT UNIQUE,
          date DATETIME NOT NULL,
          status TEXT DEFAULT 'em-andamento',
          total_price REAL DEFAULT 0,
          total_weight REAL DEFAULT 0,
          operator_id TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced_at DATETIME,
          FOREIGN KEY (tenant_id) REFERENCES tenants(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (operator_id) REFERENCES users(id)
        )
      `);

      // Tabela de linhas de orçamento
      db.run(`
        CREATE TABLE IF NOT EXISTS quotation_lines (
          id TEXT PRIMARY KEY,
          quotation_id TEXT NOT NULL,
          material_id TEXT NOT NULL,
          name TEXT NOT NULL,
          quantity REAL NOT NULL,
          weight_kg REAL NOT NULL,
          cost_price REAL NOT NULL,
          sell_price REAL NOT NULL,
          total_cost REAL NOT NULL,
          total_price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
          FOREIGN KEY (material_id) REFERENCES materials(id)
        )
      `);

      // Tabela de sync (auditoria e versionamento)
      db.run(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          user_id TEXT,
          changes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (tenant_id) REFERENCES tenants(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabela de tenants (multi-tenant)
      db.run(`
        CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          domain TEXT UNIQUE,
          subscription_status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabelas:', err);
          reject(err);
        } else {
          console.log('✅ Tabelas criadas/verificadas');
          resolve();
        }
      });
    });
  });
}

/**
 * 🗄️ Executar query com promessa
 */
export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * 🗄️ Executar run (INSERT, UPDATE, DELETE)
 */
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * 🗄️ Obter um registro
 */
export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
