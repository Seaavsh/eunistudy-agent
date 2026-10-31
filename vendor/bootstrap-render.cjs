// Recreate the public catalogue on Render's ephemeral filesystem at each start.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
const db = new DatabaseSync(path.join(process.cwd(), 'data', 'eunistud.sqlite'));
db.exec('CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,kind TEXT NOT NULL,content TEXT NOT NULL); CREATE VIRTUAL TABLE IF NOT EXISTS knowledge USING fts5(id UNINDEXED,content);');
db.close();
require('./import-catalogue.cjs');
require('./import-official.cjs');
// db.ts will build the knowledge index after adding the remaining seed records.
const initialized = new DatabaseSync(path.join(process.cwd(), 'data', 'eunistud.sqlite'));
initialized.exec('DELETE FROM knowledge');
initialized.close();
