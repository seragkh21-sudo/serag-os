function cleanText(value) {
  return String(value || '').replace(/https?:\/\/[^\s"'<>]+/gi, '[URL]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [FILTERED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?/g, '[TOKEN]')
    .slice(0, 300);
}

function safeFilename(value) {
  try {
    const url = new URL(value);
    // Dynamic paths, private Supabase objects and third-party URLs are excluded.
    if (url.origin === 'https://serag-os.vercel.app' && /^\/[a-z0-9_./-]+\.js$/i.test(url.pathname)) {
      return url.origin + url.pathname;
    }
  } catch {}
  return undefined;
}

export function sanitizeEvent(event) {
  // Allowlist the payload: no user, request, breadcrumbs, console, DOM or custom extras.
  return {
    event_id: event.event_id, timestamp: event.timestamp, platform: event.platform,
    level: event.level, release: event.release, environment: event.environment,
    exception: { values: (event.exception?.values || []).slice(0, 5).map(value => ({
      type: cleanText(value.type), value: cleanText(value.value),
      stacktrace: { frames: (value.stacktrace?.frames || []).slice(-40).map(frame => ({
        filename: safeFilename(frame.filename), function: cleanText(frame.function),
        lineno: frame.lineno, colno: frame.colno, in_app: frame.in_app
      })) }
    })) }
  };
}

export async function startMonitoring(sdk, location, fetchConfig) {
  if (location.origin !== 'https://serag-os.vercel.app' || location.pathname !== '/') return false;
  try {
    const config = await fetchConfig();
    if (!config.enabled || config.environment !== 'production') return false;
    let remaining = 10;
    sdk.init({
      dsn: config.dsn, environment: config.environment, release: config.release,
      defaultIntegrations: false,
      integrations: [sdk.globalHandlersIntegration(), sdk.eventFiltersIntegration(), sdk.dedupeIntegration()],
      sendDefaultPii: false,
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [],
        urlQueryParams: false, stackFrameVariables: false, frameContextLines: 0,
        databaseQueryData: false, genAI: { inputs: false, outputs: false } },
      maxBreadcrumbs: 0, enableLogs: false, autoSessionTracking: false,
      tracesSampleRate: 0, sampleRate: 1, sendClientReports: false,
      beforeSend(event) { return remaining-- > 0 ? sanitizeEvent(event) : null; }
    });
    return true;
  } catch { return false; }
}
