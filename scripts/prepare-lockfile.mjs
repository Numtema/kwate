import fs from 'node:fs';

const lockPath = 'package-lock.json';
const packagePath = 'package.json';
const privatePrefix = 'https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/';
const publicPrefix = 'https://registry.npmjs.org/';

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
let rewritten = 0;

for (const value of Object.values(lock.packages || {})) {
  if (typeof value?.resolved === 'string' && value.resolved.startsWith(privatePrefix)) {
    value.resolved = `${publicPrefix}${value.resolved.slice(privatePrefix.length)}`;
    rewritten += 1;
  }
}

lock.version = pkg.version;
if (lock.packages?.['']) {
  lock.packages[''].version = pkg.version;
  lock.packages[''].engines = pkg.engines;
}

const serialized = `${JSON.stringify(lock, null, 2)}\n`;
if (/internal\.api|artifactory|localhost|127\.0\.0\.1/i.test(serialized)) {
  console.error('BLOCK: package-lock still contains a private or local registry reference.');
  process.exit(1);
}

fs.writeFileSync(lockPath, serialized);
console.log(`PASS lockfile normalized (${rewritten} resolved URL${rewritten === 1 ? '' : 's'} rewritten)`);
