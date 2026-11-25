const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = process.env.CBE_DB_PATH || path.join(dataDir, 'cbe.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    subjects TEXT NOT NULL DEFAULT '[]',
    averageScore REAL NOT NULL DEFAULT 0,
    skillsetPrediction TEXT NOT NULL DEFAULT 'Developing',
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
