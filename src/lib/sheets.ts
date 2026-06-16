import type { Guest } from './types';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'אישר הגעה',
  declined: 'לא מגיע',
  pending: 'ממתין',
};

export async function syncToGoogleSheets(guests: Guest[]): Promise<void> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_ID;

  if (!email || !rawKey || !sheetId) return;

  try {
    const { google } = await import('googleapis');
    const key = rawKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: key },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const header = [['שם', 'טלפון', 'סטטוס', 'מספר מגיעים', 'זמן תגובה']];
    const rows = guests.map((g) => [
      g.name,
      g.phone,
      STATUS_LABEL[g.status] ?? g.status,
      g.guest_count,
      g.response_time ? new Date(g.response_time).toLocaleString('he-IL') : '',
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'Sheet1',
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [...header, ...rows] },
    });
  } catch (err) {
    console.error('[Google Sheets sync error]', err);
  }
}
