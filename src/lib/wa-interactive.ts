import type { WhatsAppConfig } from "@/lib/whatsapp";

/* Free-form interactive messages, sent inside the 24-hour window a guest opens
 * by tapping a button.
 *
 * Templates need Meta's approval and can only start a conversation. Once the
 * guest replies — and a quick-reply tap counts as a reply — the window is open
 * and these need no approval at all. That is what makes a multi-step exchange
 * possible: template asks "coming?", the answer opens the window, and the
 * follow-up "how many?" goes out as an ordinary message.
 *
 * Deliberately separate from sendInvitation: nothing here is paced or retried,
 * because a reply inside an open window is not a business-initiated
 * conversation and does not count against the number's daily ceiling. Making a
 * guest wait six seconds for an answer to their own tap would be absurd.
 */

const API = "https://graph.facebook.com/v21.0";

export interface Button { id: string; title: string }

export interface WaSendResult { ok: boolean; error?: string; messageId?: string }

async function post(cfg: WhatsAppConfig, body: unknown): Promise<WaSendResult> {
  try {
    const res = await fetch(`${API}/${cfg.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error?.error_user_msg ?? json?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

/** Up to three buttons — WhatsApp's limit, not ours. */
export function sendButtons(
  cfg: WhatsAppConfig, to: string, text: string, buttons: Button[],
): Promise<WaSendResult> {
  return post(cfg, {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: {
        buttons: buttons.slice(0, 3).map(b => ({
          type: "reply", reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

/** A list, for the cases three buttons cannot cover — like "how many?". */
export function sendList(
  cfg: WhatsAppConfig, to: string, text: string, buttonLabel: string, rows: Button[],
): Promise<WaSendResult> {
  return post(cfg, {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: [{ rows: rows.slice(0, 10).map(r => ({ id: r.id, title: r.title.slice(0, 24) })) }],
      },
    },
  });
}

export function sendText(cfg: WhatsAppConfig, to: string, text: string): Promise<WaSendResult> {
  return post(cfg, {
    messaging_product: "whatsapp", to, type: "text",
    text: { body: text, preview_url: false },
  });
}

/* Guests answer "how many" in words as often as with a tap: "2", "שניים",
   "אנחנו 3", "אני ועוד אחד". Reading that badly is worse than not reading it —
   a wrong headcount reaches the caterer — so anything ambiguous returns null
   and the question is asked again rather than guessed at. */
const WORDS: Record<string, number> = {
  "אחד": 1, "אחת": 1, "לבד": 1, "רק אני": 1,
  "שניים": 2, "שתיים": 2, "שנינו": 2, "זוג": 2,
  "שלושה": 3, "שלוש": 3, "ארבעה": 4, "ארבע": 4,
  "חמישה": 5, "חמש": 5, "שישה": 6, "שש": 6,
  "שבעה": 7, "שבע": 7, "שמונה": 8, "תשעה": 9, "תשע": 9, "עשרה": 10, "עשר": 10,
};

export function parseGuestCount(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;

  const digits = t.match(/\d+/g);
  if (digits) {
    /* "אני ועוד 2" is three people, but so is "3" — and we cannot tell which
       the guest meant. One number only, or ask again. */
    if (digits.length > 1) return null;
    const n = parseInt(digits[0], 10);
    return n >= 1 && n <= 20 ? n : null;
  }

  for (const [w, n] of Object.entries(WORDS)) {
    if (t.includes(w)) return n;
  }
  return null;
}
