import * as Sentry from '@sentry/nextjs';
import { flags } from '@/lib/feature-flags';

// Edge runtime has restricted APIs — keep config minimal.
if (flags.sentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
