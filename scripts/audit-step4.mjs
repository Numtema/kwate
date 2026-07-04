import { readFile, stat } from 'node:fs/promises';

const requiredFiles = [
  'lib/insforge/sdk-browser.ts',
  'lib/insforge/auth-client.ts',
  'lib/insforge/auth-types.ts',
  'features/auth/schema.ts',
  'features/auth/errors.ts',
  'features/auth/adapters.ts',
  'features/auth/profile-bootstrap.ts',
  'components/AuthProvider.tsx',
  'components/AuthRouteState.tsx',
  'app/login/page.tsx',
  'app/signup/page.tsx',
  'app/verify-email/page.tsx',
  'app/forgot-password/page.tsx',
  'app/reset-password/page.tsx',
  'docs/27_AUTH_RUNTIME_INTEGRATION.md',
  'docs/28_AUTH_TEST_CHECKLIST.md',
  'ai/AUTH_RUNTIME_REGISTRY.yml',
];

const passes = [];
const failures = [];

async function text(path) {
  return readFile(path, 'utf8');
}

function check(condition, pass, fail) {
  if (condition) passes.push(pass);
  else failures.push(fail);
}

for (const file of requiredFiles) {
  try {
    const info = await stat(file);
    check(info.isFile() && info.size > 0, `${file}: present`, `${file}: missing or empty`);
  } catch {
    failures.push(`${file}: missing`);
  }
}

const packageJson = JSON.parse(await text('package.json'));
check(Boolean(packageJson.dependencies?.['@insforge/sdk']), 'dependency: @insforge/sdk', 'dependency: @insforge/sdk missing');
check(Boolean(packageJson.dependencies?.zod), 'dependency: zod', 'dependency: zod missing');

const layout = await text('app/layout.tsx');
check(layout.includes('<AuthProvider>'), 'layout: AuthProvider mounted', 'layout: AuthProvider missing');

const appLayout = await text('components/AppLayout.tsx');
for (const route of ['/profile', '/settings', '/messages', '/publish']) {
  check(appLayout.includes(`'${route}'`), `guard: ${route}`, `guard: ${route} missing`);
}
check(appLayout.includes('/login?next='), 'guard: preserves safe next route', 'guard: next route missing');

const sdk = await text('lib/insforge/sdk-browser.ts');
check(sdk.includes("from '@insforge/sdk'"), 'sdk: official package imported', 'sdk: official package not imported');
check(sdk.includes('detectOAuthCallback'), 'sdk: callback detection configured', 'sdk: callback detection missing');

const authClient = await text('lib/insforge/auth-client.ts');
for (const method of [
  'getPublicAuthConfig',
  'getCurrentUser',
  'signInWithPassword',
  'signUp',
  'signOut',
  'verifyEmail',
  'resendVerificationEmail',
  'sendResetPasswordEmail',
  'exchangeResetPasswordToken',
  'resetPassword',
]) {
  check(authClient.includes(`.${method}(`), `auth method: ${method}`, `auth method missing: ${method}`);
}

const authFiles = await Promise.all([
  'lib/insforge/sdk-browser.ts',
  'lib/insforge/auth-client.ts',
  'components/AuthProvider.tsx',
  'app/login/page.tsx',
  'app/signup/page.tsx',
  'app/verify-email/page.tsx',
  'app/forgot-password/page.tsx',
  'app/reset-password/page.tsx',
].map(text));
const authSource = authFiles.join('\n');
check(!/localStorage\s*\.(?:setItem|getItem)\s*\([^)]*(?:token|auth|session)/i.test(authSource), 'security: no auth token localStorage', 'security: auth token localStorage detected');
check(!/sessionStorage\s*\.(?:setItem|getItem)\s*\([^)]*(?:token|auth|session)/i.test(authSource), 'security: no auth token sessionStorage', 'security: auth token sessionStorage detected');
check(!authSource.includes('INSFORGE_ADMIN_TOKEN'), 'security: no admin token in auth client', 'security: admin token referenced in auth client');
check(!authSource.includes('setTimeout('), 'auth UI: simulations removed', 'auth UI: setTimeout simulation remains');

const env = await text('.env.example');
check(env.includes('NEXT_PUBLIC_INSFORGE_URL='), 'env: public URL declared', 'env: public URL missing');
check(env.includes('NEXT_PUBLIC_INSFORGE_ANON_KEY='), 'env: anon key declared', 'env: anon key missing');

console.log(`STEP 4 AUTH AUDIT — ${passes.length} PASS / ${failures.length} FAIL`);
for (const item of passes) console.log(`PASS ${item}`);
for (const item of failures) console.error(`FAIL ${item}`);

if (failures.length) process.exit(1);
