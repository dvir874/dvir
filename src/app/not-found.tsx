'use client';

import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💍</div>
      <h1
        style={{
          fontFamily: 'Frank Ruhl Libre, serif',
          fontSize: '2rem',
          color: '#1C1008',
          marginBottom: '0.5rem',
        }}
      >
        הדף לא נמצא
      </h1>
      <p style={{ color: '#6B7B5A', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
        הקישור שהגעת אליו אינו תקין או שפג תוקפו. אם קיבלת קישור מהזוג — בקש קישור חדש.
      </p>
      <Link
        href="/"
        style={{
          background: 'linear-gradient(135deg, #C5A46D, #a8864d)',
          color: '#fff',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
        }}
      >
        חזור לעמוד הבית
      </Link>
    </div>
  );
}
