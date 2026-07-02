/**
 * SQLite database setup using Node.js built-in sqlite module.
 * Creates users, wallets, and transactions tables on first run.
 */
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'cctn.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    surname TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    nationalId TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    passwordHash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(userId, createdAt DESC);

  CREATE TABLE IF NOT EXISTS pending_payments (
    reference TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    provider TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount REAL NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const txColumns = db.prepare('PRAGMA table_info(transactions)').all();
if (!txColumns.some((col) => col.name === 'gatewayReference')) {
  db.exec('ALTER TABLE transactions ADD COLUMN gatewayReference TEXT');
}
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_gateway_ref
  ON transactions(gatewayReference)
  WHERE gatewayReference IS NOT NULL;
`);

module.exports = db;
