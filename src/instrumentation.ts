// Next.js 14 instrumentation hook — runs once on server startup.
// Sentry server/edge SDK is initialized here, not in individual routes.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
