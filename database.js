const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'expenses.db');
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS expenses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date TEXT NOT NULL)
`);

module.exports = db;
