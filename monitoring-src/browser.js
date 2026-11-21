import { init, globalHandlersIntegration, eventFiltersIntegration, dedupeIntegration } from '@sentry/browser';
import { startMonitoring } from './privacy.js';

void startMonitoring({ init, globalHandlersIntegration, eventFiltersIntegration, dedupeIntegration },
  window.location, async () => {
    const response = await fetch('/api/monitoring-config', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!response.ok) return { enabled: false };
    return response.json();
  });
