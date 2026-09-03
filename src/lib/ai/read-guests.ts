import { GUEST_LIST_PROMPT, readGuestList, type GuestListRead } from "./guest-list";

/* The one network call for reading a guest list.
 *
 * Everything that decides what to keep lives in guest-list.ts and is tested
 * without a key. This file only carries the list to a model.
 *
 * Two inputs, one difference that matters.
 *
 * PASTED TEXT has a source: the words the couple sent. Every line of it that
 * carries a phone must come back, and guest-list.ts proves it.
 *
 * A PHOTOGRAPH has none — nothing exists to compare the answer against. So the
 * model is asked for its own transcription first, and that becomes the source.
 * It is a weaker check than the real thing and it is not nothing: it catches
 * the case that actually happens, where the model reads a whole page and then
 * returns rows for part of it. What it cannot catch is a line the model never
 * saw, which is why a photographed list says so on screen.
 */

export type GuestReadResult =
  | { ok: true; read: GuestListRead; usedTranscript: boolean }
  | { ok: false; reason: "not_configured" | "too_large" | "bad_type" | "empty" | "failed"; detail?: string };

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_TEXT = 60_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const IMAGE_PROMPT = `${GUEST_LIST_PROMPT}

בנוסף, החזר בשדה "raw" את כל הטקסט שקראת מהתמונה, שורה בשורה, בדיוק כפי שהוא מופיע.`;

export async function readGuests(
  input: { text: string } | { bytes: Uint8Array; mime: string },
): Promise<GuestReadResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, reason: "not_configured" };

  const isImage = "bytes" in input;
  if (isImage) {
    if (!ALLOWED.has(input.mime)) return { ok: false, reason: "bad_type", detail: input.mime };
    if (input.bytes.byteLength > MAX_BYTES) {
      return { ok: false, reason: "too_large", detail: `${(input.bytes.byteLength / 1048576).toFixed(1)}MB` };
    }
  } else {
    const t = input.text.trim();
    if (!t) return { ok: false, reason: "empty" };
    if (t.length > MAX_TEXT) return { ok: false, reason: "too_large", detail: `${t.length} תווים` };
  }

  const content = isImage
    ? [
        { type: "image", source: { type: "base64", media_type: input.mime, data: Buffer.from(input.bytes).toString("base64") } },
        { type: "text", text: IMAGE_PROMPT },
      ]
    : [{ type: "text", text: `${GUEST_LIST_PROMPT}\n\n---\n${input.text}` }];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      /* A 500-name list is a long answer. The invitation reader's 800 tokens
         would have truncated the JSON halfway down the list — which arrives
         here as a parse failure and, without the source check, as a short
         list nobody questions. */
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-5",
        max_tokens: 16_000,
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let msg = body.slice(0, 300);
      try {
        const j = JSON.parse(body) as { error?: { type?: string; message?: string } };
        if (j?.error?.message) msg = `${j.error.type ?? ""} ${j.error.message}`.trim();
      } catch { /* not JSON */ }
      return { ok: false, reason: "failed", detail: `HTTP ${res.status} · ${msg}` };
    }

    const data = await res.json() as {
      content?: { type: string; text?: string }[];
      stop_reason?: string;
    };
    const text = (data.content ?? []).filter(c => c.type === "text").map(c => c.text ?? "").join("\n");

    /* Truncated output is a short list that looks complete. Say so. */
    if (data.stop_reason === "max_tokens") {
      return { ok: false, reason: "failed", detail: "הרשימה ארוכה מדי לקריאה אחת — פצלו אותה לשניים" };
    }

    let source: string;
    let usedTranscript = false;
    if (isImage) {
      const m = text.match(/"raw"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      source = m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
      usedTranscript = !!source;
    } else {
      source = input.text;
    }

    return { ok: true, read: readGuestList(text, source), usedTranscript };
  } catch (err) {
    return { ok: false, reason: "failed", detail: err instanceof Error ? err.message : "network" };
  }
}
