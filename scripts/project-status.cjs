// Read-only summary. Never print environment values or personal database rows.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function git(...args) {
  const result = spawnSync('git', args, { cwd: process.cwd(), encoding: 'utf8', timeout: 5000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

const status = git('status', '--porcelain=v1');
const result = {
  directory: process.cwd(),
  git: {
    branch: git('branch', '--show-current'),
    commit: git('rev-parse', 'HEAD'),
    originMain: git('rev-parse', '--verify', 'refs/remotes/origin/main'),
    upstream: git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'),
    changedFiles: status === null ? null : status ? status.split(/\r?\n/).length : 0,
  },
  catalogue: { status: 'database missing', groups: [] },
};

const databasePath = path.join(process.cwd(), 'data', 'eunistud.sqlite');
if (fs.existsSync(databasePath)) {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const groups = db.prepare('SELECT country, kind, COUNT(*) AS count FROM programme_catalog GROUP BY country, kind ORDER BY country, kind').all();
      result.catalogue = { status: 'available', groups };
    } finally {
      db.close();
    }
  } catch {
    result.catalogue.status = 'unavailable (check Node version, database schema and file access)';
  }
}

console.log(JSON.stringify(result, null, 2));
