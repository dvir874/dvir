import { INVITATION_PROMPT, readInvitation, type InvitationRead } from "./invitation";

/* The one network call in this feature.
 *
 * Everything that decides what to keep lives in invitation.ts and is tested
 * without a key. This file only carries the picture to a model and hands what
 * comes back to that validator — so a bad model, a rate limit or a hallucinated
 * field all arrive at the same gate.
 *
 * Absent a key the feature is simply not there. Not a stub that returns empty
 * fields, which would look like an invitation the model could not read; a
 * distinct answer the screen can say out loud.
 */

export type ReadResult =
  | { ok: true; read: InvitationRead }
  | { ok: false; reason: "not_configured" | "too_large" | "bad_type" | "failed"; detail?: string };

/* Meta's own limit for an image, and a sane one for a model. An invitation is a
   phone photograph; anything past this is a scan nobody needed. */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function readInvitationImage(
  bytes: Uint8Array, mime: string, now: Date = new Date(),
): Promise<ReadResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, reason: "not_configured" };
  if (!ALLOWED.has(mime)) return { ok: false, reason: "bad_type", detail: mime };
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, reason: "too_large", detail: `${(bytes.byteLength / 1048576).toFixed(1)}MB` };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(40_000),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-5",
        max_tokens: 800,
        /* Zero temperature: the same invitation photographed twice must not
           produce two different weddings. */
        temperature: 0,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mime, data: Buffer.from(bytes).toString("base64") } },
            { type: "text", text: INVITATION_PROMPT },
          ],
        }],
      }),
    });

    if (!res.ok) {
      /* The provider's own words, trimmed. A 401 says the key is wrong, a 404 says the
         model name is, and a 429 says neither — and they are indistinguishable
         from "it did not work". */
      const body = await res.text().catch(() => "");
      let msg = body.slice(0, 300);
      try {
        const j = JSON.parse(body) as { error?: { type?: string; message?: string } };
        if (j?.error?.message) msg = `${j.error.type ?? ""} ${j.error.message}`.trim();
      } catch { /* not JSON */ }
      return { ok: false, reason: "failed", detail: `HTTP ${res.status} · ${msg}` };
    }

    const data = await res.json() as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter(c => c.type === "text").map(c => c.text ?? "").join("\n");

    /* Straight to the validator, whatever came back. It is built to be handed
       prose, a code fence, or nothing at all. */
    return { ok: true, read: readInvitation(text, now) };
  } catch (err) {
    return { ok: false, reason: "failed", detail: err instanceof Error ? err.message : "network" };
  }
}
