import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt    = 'רגע לפני — ניהול אורחים לחתונות';
export const size   = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #F6F1E8 0%, #EDE6D6 60%, #D4BC8A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          direction: 'rtl',
          position: 'relative',
        }}
      >
        {/* Gold border frame */}
        <div style={{
          position: 'absolute', inset: 24,
          border: '2px solid rgba(197,164,109,0.5)',
          borderRadius: 24,
          display: 'flex',
        }} />

        {/* Corner ornaments */}
        <div style={{ position: 'absolute', top: 40, right: 40, fontSize: 28, color: '#C5A46D' }}>✦</div>
        <div style={{ position: 'absolute', top: 40, left: 40, fontSize: 28, color: '#C5A46D' }}>✦</div>
        <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 28, color: '#C5A46D' }}>✦</div>
        <div style={{ position: 'absolute', bottom: 40, left: 40, fontSize: 28, color: '#C5A46D' }}>✦</div>

        <div style={{ fontSize: 72, marginBottom: 24 }}>💍</div>

        <div style={{ fontSize: 56, fontWeight: 700, color: '#333333', marginBottom: 16, letterSpacing: '-1px' }}>
          רגע לפני
        </div>

        <div style={{
          width: 80, height: 2,
          background: 'linear-gradient(to right, transparent, #C5A46D, transparent)',
          marginBottom: 20,
        }} />

        <div style={{ fontSize: 28, color: 'rgba(51,51,51,0.65)', textAlign: 'center', maxWidth: 700, lineHeight: 1.4 }}>
          ניהול אורחים חכם לחתונות ואירועים
        </div>

        <div style={{ marginTop: 32, fontSize: 20, color: '#C5A46D', fontWeight: 600, letterSpacing: '0.15em' }}>
          REGALIFNEI.VERCEL.APP
        </div>
      </div>
    ),
    { ...size },
  );
}
