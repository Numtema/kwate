import fs from 'node:fs';

const failures = [];
const passes = [];
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const npmrc = fs.readFileSync('.npmrc', 'utf8');

function check(condition, label) {
  (condition ? passes : failures).push(label);
}

check(pkg.version === lock.version, 'package and lock versions match');
check(lock.lockfileVersion === 3, 'lockfileVersion is 3');
check(pkg.engines?.node === '22.x', 'Node runtime is pinned to 22.x');
check(pkg.packageManager === 'npm@10.9.2', 'npm package manager is pinned');
check(npmrc.includes('registry=https://registry.npmjs.org/'), 'public npm registry is explicit');

const resolved = Object.entries(lock.packages || {})
  .filter(([, value]) => value?.resolved)
  .map(([name, value]) => ({name, url: value.resolved}));

const forbidden = resolved.filter(({url}) =>
  /internal\.api|localhost|127\.0\.0\.1|artifactory|file:|link:/i.test(url),
);
const nonPublic = resolved.filter(({url}) => {
  try {
    return new URL(url).hostname !== 'registry.npmjs.org';
  } catch {
    return true;
  }
});

check(forbidden.length === 0, 'lockfile contains no private/internal registry URL');
check(nonPublic.length === 0, 'all resolved packages use registry.npmjs.org');
check(resolved.length > 100, 'lockfile contains a complete dependency graph');

for (const label of passes) console.log(`PASS ${label}`);
for (const label of failures) console.error(`FAIL ${label}`);
if (forbidden.length) console.error(forbidden.slice(0, 10));
if (nonPublic.length) console.error(nonPublic.slice(0, 10));

console.log(`Lockfile audit: ${passes.length} PASS / ${failures.length} FAIL`);
if (failures.length) process.exit(1);
