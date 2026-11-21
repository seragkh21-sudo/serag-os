// Only the public browser DSN is exposed. Never return environment objects/tokens.
export function publicSentryConfig(env = process.env) {
  const disabled = { enabled: false };
  if (env.VERCEL_ENV !== 'production' || env.SENTRY_ENABLED !== 'true') return disabled;
  try {
    const dsn = new URL(env.SENTRY_DSN);
    if (dsn.protocol !== 'https:' || dsn.password || dsn.port || dsn.search || dsn.hash ||
        !/^[a-f0-9]+$/i.test(dsn.username) || !/^\/\d+$/.test(dsn.pathname) ||
        !/^o\d+\.ingest(?:\.[a-z]+)?\.sentry\.io$/.test(dsn.hostname)) return disabled;
    return { enabled: true, dsn: dsn.href, environment: 'production',
      release: 'serag-os@' + (/^[a-f0-9]{40}$/i.test(env.VERCEL_GIT_COMMIT_SHA || '')
        ? env.VERCEL_GIT_COMMIT_SHA : 'build-94') };
  } catch { return disabled; }
}
