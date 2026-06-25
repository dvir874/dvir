import * as Sentry from '@sentry/nextjs';
import { flags } from '@/lib/feature-flags';

if (flags.sentry) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Capture 10% of sessions for performance tracing — low overhead.
    tracesSampleRate: 0.1,

    // Replay 5% of sessions, 100% of sessions with an error.
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Strip PII before any event leaves the browser.
    // We sanitize specific fields known to carry PII rather than deep-cloning
    // the entire event (which would break Sentry's internal type guarantees).
    beforeSend(event) {
      // Redact request body — may contain guest names or phone numbers
      if (event.request?.data) {
        event.request.data = '[request body redacted]';
      }
      // Redact user identity fields — we track events by ID, not by name/email
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },

    integrations: [
      Sentry.replayIntegration({
        // Never record input values — prevents capturing typed phone/name/etc.
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
  });
}
