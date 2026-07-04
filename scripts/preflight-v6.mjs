import fs from 'node:fs';
import process from 'node:process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredFiles = [
  'package.json',
  'package-lock.json',
  '.npmrc',
  '.nvmrc',
  'vercel.json',
  'AGENTS.md',
  '.github/workflows/ci.yml',
  '.github/workflows/insforge-provision.yml',
  '.github/workflows/v7-production-smoke.yml',
  '.github/workflows/media-orphan-cleanup.yml',
  'scripts/provision-insforge.mjs',
  'insforge/migrations/001_kwate_core_schema.sql',
  'insforge/migrations/002_kwate_full_app.sql',
  'insforge/migrations/003_kwate_media_pipeline.sql',
  'insforge/rls/001_kwate_core_rls.sql',
  'insforge/rls/002_kwate_full_app_rls.sql',
];

const envChecks = {
  NEXT_PUBLIC_INSFORGE_URL: Boolean(process.env.NEXT_PUBLIC_INSFORGE_URL),
  NEXT_PUBLIC_INSFORGE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY),
  INSFORGE_API_BASE_URL: Boolean(process.env.INSFORGE_API_BASE_URL),
  INSFORGE_ADMIN_CREDENTIAL: Boolean(process.env.INSFORGE_ADMIN_TOKEN || process.env.INSFORGE_API_KEY),
  STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
};

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));
const nodeMajor = Number(process.versions.node.split('.')[0]);
const report = {
  generatedAt: new Date().toISOString(),
  version: pkg.version,
  node: process.versions.node,
  nodeRuntimeOk: nodeMajor === 22,
  requiredFilesOk: missingFiles.length === 0,
  missingFiles,
  environmentConfigured: envChecks,
  safeToBuild: missingFiles.length === 0 && nodeMajor === 22,
  safeToProvision: missingFiles.length === 0 && envChecks.INSFORGE_API_BASE_URL && envChecks.INSFORGE_ADMIN_CREDENTIAL,
};

console.log(JSON.stringify(report, null, 2));
if (!report.nodeRuntimeOk) console.error('BLOCK: use Node 22.x (.nvmrc).');
if (missingFiles.length) console.error(`BLOCK: missing files: ${missingFiles.join(', ')}`);
if (!report.safeToBuild) process.exit(1);
