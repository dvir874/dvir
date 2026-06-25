'use client';

import { useEffect } from 'react';

export default function CoupleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[couple dashboard error]', error);
  }, [error]);

  return (
    <div
      dir="rtl"
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
        משהו השתבש
      </h2>
      <p style={{ color: '#6B7B5A', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
        אירעה שגיאה בטעינת הדף. נסו לרענן — אם הבעיה ממשיכה, פנו אלינו בוואטסאפ.
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
    </div>
  );
}
