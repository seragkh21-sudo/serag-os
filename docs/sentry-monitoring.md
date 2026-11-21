# Sentry browser error monitoring — build 94

The same-origin bundle uses pinned `@sentry/browser` 11.16.0. Vercel builds it with `node scripts/build-monitoring.mjs` before the existing natural-audio build. It loads asynchronously on the production entry page and fetches `/api/monitoring-config` with a four-second timeout. Monitoring failure does not block app boot. Errors before initialization are not buffered.

## Configuration

Create a **Browser JavaScript** Sentry project. Set production Vercel variables `SENTRY_DSN` (the public browser DSN) and `SENTRY_ENABLED=true`, then deploy. Never provide an auth token to browser code. The config endpoint exposes only a validated public Sentry SaaS DSN, environment and commit-based release; it returns disabled outside production or without explicit enablement. Set `SENTRY_ENABLED=false` and redeploy to disable. No account billing settings are changed.

Only `https://serag-os.vercel.app/` initializes monitoring. Fixture pages, localhost and deployment previews do not report. Add another production domain explicitly in the source before using it. CSP permits the Sentry ingestion connection while retaining existing script hashes and service sources. No third-party SDK script loader is used.

## Collection and limits

- Captures unhandled JavaScript exceptions and promise rejections after initialization. Handled errors, failed HTTP responses and server API exceptions are not automatically reported; server instrumentation is a separate task.
- No Session Replay, tracing, profiling, metrics, logs, automatic sessions, console/DOM/network breadcrumbs or Supabase instrumentation integrations are enabled.
- User identity, cookies, headers, HTTP bodies, URL parameters, local variables and source context collection are disabled. The final event allowlist removes user/request/context/extra/breadcrumb fields and keeps bounded exception types, messages and stack locations. Message text has URL/email/Bearer/JWT scrubbing but arbitrary sensitive prose in an exception message cannot be recognized reliably; do not throw user drafts or private content in errors.
- Stack filenames are restricted to public JavaScript paths on the production origin, without query or fragment. Sentry still receives network connection metadata such as source IP at ingestion; configure project-side IP/data scrubbing and retention as appropriate. This implementation does not claim anonymous transport.
- At most ten error events per page lifetime pass `beforeSend`; this is not an account-wide quota or guaranteed cost cap. Sentry project quotas and spend settings remain controlled in the Sentry account.

## Verification

Run `npm test`, `node scripts/build-monitoring.mjs`, and `node scripts/build-natural-audio.mjs`. Tests cover production gating, invalid DSNs, environment disclosure, sensitive event fields, SDK collection settings, fail-open setup and event bounds. A browser check should intercept the Sentry envelope and verify initialization, unhandled errors, CSP and successful app boot. A real production smoke error may then be sent once and identified as `SERAG_SENTRY_CONNECTION_TEST`; HTTP acceptance does not prove visibility in the owner's Issues dashboard.

No Sentry auth token, source map upload or management API access is required for browser error ingestion. Existing application scripts are readable JavaScript; the generated SDK is minified. [Official configuration reference](https://docs.sentry.io/platforms/javascript/configuration/options/).

Implemented validation: 228 Node tests pass; both production bundles build. Chromium ran the actual entry/bootstrap with the existing Supabase fixture adapter under the production CSP, reached `serag-ready`, and emitted two intercepted SDK envelopes for a thrown error and an unhandled rejection. Email/URL scrubbing was verified in those envelopes. These fixture envelopes were intercepted and not sent to the owner’s project.
