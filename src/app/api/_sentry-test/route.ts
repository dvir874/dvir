import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// TEMPORARY — Sprint 1 verification only. Remove after verification.
export async function GET() {
  const testError = new Error('[Sprint1-Test] Sentry server verification — safe to ignore');
  Sentry.captureException(testError);
  return NextResponse.json({ sent: true, message: 'Test error sent to Sentry' });
}
