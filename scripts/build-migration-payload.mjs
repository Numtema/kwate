import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const [file, version, name] = process.argv.slice(2);

if (!file || !version || !name) {
  console.error('Usage: node scripts/build-migration-payload.mjs <sql-file> <version> <name>');
  process.exit(1);
}

const sql = await readFile(file, 'utf8');
const payload = {
  version,
  name,
  sql,
  sourceFile: basename(file),
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
