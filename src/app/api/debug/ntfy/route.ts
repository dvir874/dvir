import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const topic = process.env.NTFY_TOPIC ?? 'regalifnei-leads';
  const url   = `https://ntfy.sh/${topic}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Title': '🔧 בדיקת חיבור מ-Vercel',
        'Priority': 'high',
        'Tags': 'white_check_mark',
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: 'הודעת בדיקה — אם הגעת לכאן, ntfy עובד מ-Vercel ✓',
      signal: AbortSignal.timeout(8000),
    });

    const body = await res.text();
    return NextResponse.json({
      ok:     res.ok,
      status: res.status,
      topic,
      url,
      body,
    });
  } catch (err) {
    return NextResponse.json({
      ok:    false,
      error: String(err),
      topic,
      url,
    }, { status: 500 });
  }
}
