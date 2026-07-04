import fs from 'node:fs';

const checks = [];
const fail = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const assert = (condition, label) => (condition ? checks : fail).push(label);

const pkg = JSON.parse(read('package.json'));
const ci = read('.github/workflows/ci.yml');
const provision = read('.github/workflows/insforge-provision.yml');
const agents = read('AGENTS.md');
const provisionScript = read('scripts/provision-insforge.mjs');
const vercel = JSON.parse(read('vercel.json'));

assert(/^0\.(6|7)\./.test(pkg.version), 'package preserves V6+ hardening baseline');
assert(pkg.scripts['audit:lockfile'], 'lockfile audit command exists');
assert(pkg.scripts['prepare:lockfile'], 'portable lockfile normalization command exists');
assert(pkg.scripts['verify:ci'], 'deterministic CI verification command exists');
assert(pkg.engines?.node === '22.x', 'Node runtime is pinned');
assert(vercel.installCommand.includes('prepare-lockfile.mjs'), 'Vercel normalizes legacy lock URLs before install');
assert(vercel.installCommand.includes('npm ci'), 'Vercel uses npm ci');
assert(vercel.installCommand.includes('--no-audit'), 'Vercel install avoids network audit side effects');
assert(ci.includes('npm run verify:ci'), 'CI runs full verification');
assert(ci.includes('permissions:\n  contents: read'), 'CI uses read-only repository permissions');
assert(provision.includes('workflow_dispatch:'), 'InsForge workflow is manual only');
assert(!/push:\s*\n|pull_request:\s*\n/.test(provision), 'InsForge provisioning is not triggered by push or PR');
assert(provision.includes('KWATE_PROVISION'), 'InsForge apply requires an explicit confirmation phrase');
assert(provision.includes('environment: ${{ inputs.target }}'), 'GitHub environment approval can protect provisioning');
assert(provisionScript.includes("mode === 'apply'"), 'provisioner separates apply mode');
assert(provisionScript.includes('CONFIRM_INSFORGE_TARGET_HOST'), 'provisioner verifies target host');
assert(agents.includes('## Agent Operating Modes'), 'AGENTS OS defines operating modes');
assert(agents.includes('## Mandatory Preflight'), 'AGENTS OS defines mandatory preflight');
assert(agents.includes('## PASS / BLOCK Contract'), 'AGENTS OS defines verdict contract');
assert(agents.includes('Never print secret values'), 'AGENTS OS protects secrets');

for (const label of checks) console.log(`PASS ${label}`);
for (const label of fail) console.error(`FAIL ${label}`);
console.log(`V6 audit: ${checks.length} PASS / ${fail.length} FAIL`);
if (fail.length) process.exit(1);
