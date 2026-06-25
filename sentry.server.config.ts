import * as Sentry from '@sentry/nextjs';
import { flags } from '@/lib/feature-flags';

if (flags.sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // 10% of server-side traces — sufficient to detect patterns
    tracesSampleRate: 0.1,

    // Strip PII before sending to Sentry servers.
    beforeSend(event) {
      // Strip request body — may contain guest names, phones, or message content
      if (event.request?.data) {
        event.request.data = '[request body redacted]';
      }
      // Strip user identity — track issues by event_id (UUID), not by name/email
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },
  });
}
