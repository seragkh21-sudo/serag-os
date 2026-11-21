import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicSentryConfig } from '../lib/sentry-config.js';
import handler from '../api/monitoring-config.js';
import { sanitizeEvent, startMonitoring } from '../monitoring-src/privacy.js';

const dsn = 'https://abc123@o123.ingest.us.sentry.io/456';
test('Sentry only exposes a valid public production DSN and never other environment values', () => {
  const env = { VERCEL_ENV: 'production', SENTRY_ENABLED: 'true', SENTRY_DSN: dsn,
    SENTRY_AUTH_TOKEN: 'private-token', SUPABASE_SERVICE_ROLE_KEY: 'private-key' };
  assert.equal(publicSentryConfig(env).enabled, true);
  assert.equal(JSON.stringify(publicSentryConfig(env)).includes('private'), false);
  for (const override of [{ VERCEL_ENV: 'preview' }, { SENTRY_ENABLED: 'false' },
    { SENTRY_DSN: 'https://abc@evil.test/456' }, { SENTRY_DSN: dsn + '?token=private' },
    { SENTRY_DSN: dsn.replace('abc123@', 'abc123:secret@') }, { SENTRY_DSN: '' }]) {
    assert.deepEqual(publicSentryConfig({ ...env, ...override }), { enabled: false });
  }
});

test('monitoring endpoint is GET-only and never cached', () => {
  const res = { headers: {}, setHeader(k,v) { this.headers[k] = v; },
    status(n) { this.code = n; return this; }, json(body) { this.body = body; return this; } };
  handler({ method: 'POST' }, res);
  assert.equal(res.code, 405);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(res.headers.Allow, 'GET');
});

test('event allowlist removes account/DOM/request details and sanitizes stack URLs', () => {
  const event = sanitizeEvent({ user: { email: 'private@example.test' }, request: { headers: { authorization: 'secret' } },
    breadcrumbs: [{ message: 'private draft' }], extra: { text: 'private draft' }, contexts: { secret: 'private' },
    exception: { values: [{ type: 'Error', value: 'Failed https://example.test/private?token=secret private@example.test Bearer secret',
      stacktrace: { frames: [{ filename: 'https://serag-os.vercel.app/app.js?token=secret', lineno: 12,
        vars: { password: 'secret' }, pre_context: ['private draft'] },
      { filename: 'https://example.supabase.co/storage/private?token=secret' }] } }] } });
  const serialized = JSON.stringify(event);
  for (const secret of ['private', 'secret', 'token=', 'supabase', 'draft']) assert.equal(serialized.includes(secret), false);
  assert.equal(event.exception.values[0].stacktrace.frames[0].filename, 'https://serag-os.vercel.app/app.js');
  assert.equal(event.exception.values[0].stacktrace.frames[0].lineno, 12);
});

test('monitoring is production-root only, fails open, disables rich collection and bounds errors', async () => {
  let options, reads = 0;
  const sdk = { init(o) { options = o; }, globalHandlersIntegration: () => 'global',
    eventFiltersIntegration: () => 'filters', dedupeIntegration: () => 'dedupe' };
  const read = async () => { reads++; return { enabled: true, dsn, environment: 'production' }; };
  for (const location of [{ origin: 'http://localhost:8765', pathname: '/' },
    { origin: 'https://serag-os.vercel.app', pathname: '/workspace-preview' },
    { origin: 'https://preview.vercel.app', pathname: '/' }]) {
    assert.equal(await startMonitoring(sdk, location, read), false);
  }
  assert.equal(reads, 0);
  const location = { origin: 'https://serag-os.vercel.app', pathname: '/' };
  assert.equal(await startMonitoring(sdk, location, async () => { throw Error('offline'); }), false);
  assert.equal(await startMonitoring(sdk, location, read), true);
  assert.equal(options.defaultIntegrations, false);
  assert.equal(options.dataCollection.userInfo, false);
  assert.deepEqual(options.dataCollection.httpBodies, []);
  assert.equal(options.maxBreadcrumbs, 0);
  assert.equal(options.tracesSampleRate, 0);
  for (let i = 0; i < 10; i++) assert.ok(options.beforeSend({}));
  assert.equal(options.beforeSend({}), null);
});

test('production SDK is same-origin and CSP retains existing service permissions', () => {
  const html = readFileSync('index.html', 'utf8');
  const version = readFileSync('app-bootstrap.js', 'utf8').match(/const V='(\d+)'/)[1];
  assert.ok(html.includes('src="/assets/monitoring/sentry.js?v=' + version + '" async'));
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const csp = config.headers.flatMap(g => g.headers).find(h => h.key === 'Content-Security-Policy').value;
  for (const source of ['https://*.sentry.io', 'https://*.hf.co', 'https://www.youtube.com/iframe_api', "'wasm-unsafe-eval'"]) assert.ok(csp.includes(source));
});
