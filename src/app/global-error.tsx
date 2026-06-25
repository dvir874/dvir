'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry if enabled. PII is stripped by beforeSend in sentry.client.config.ts.
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          minHeight: '100vh',
          background: '#F2EDE3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Heebo, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2
          style={{
            fontFamily: 'Frank Ruhl Libre, serif',
            fontSize: '1.5rem',
            color: '#1C1008',
            marginBottom: '0.75rem',
          }}
        >
          אירעה שגיאה לא צפויה
        </h2>
        <p style={{ color: '#6B7B5A', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
          אנחנו קיבלנו התראה ועובדים על זה. אפשר לנסות שוב או לפנות אלינו בוואטסאפ.
        </p>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #C5A46D, #a8864d)',
            color: '#fff',
            padding: '0.65rem 1.75rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          נסה שוב
        </button>
      </body>
    </html>
  );
}
