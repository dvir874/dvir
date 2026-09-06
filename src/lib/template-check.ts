/* Kept out of whatsapp.ts on purpose: node:test loads that file directly and
   cannot resolve the "@/" alias, so anything whatsapp.ts imports has to be
   importable by raw node. The preflight needs both the shape comparison and
   the sender's own component builder, so it lives one level up instead. */
import { API_VERSION, invitationComponents, type WhatsAppConfig } from "@/lib/whatsapp";
import { shapeOfOutgoing, templateProblem } from "@/lib/template-shape";

/** Preflight: does the template we are about to use still fit what we send?
 *
 * Run once per send run, before the first message. The nineteen reminders that
 * failed #132000 all failed identically and for the same reason, and Meta knew
 * the reason before the first one left — the template definition it rejected
 * them against was readable over the same API the whole time.
 *
 * Fails OPEN. A template really is broken only when Meta tells us its shape and
 * the shape disagrees; a network blip, a rate limit or an unexpected response
 * body says nothing about the template, and a send run must not be cancelled by
 * this check being unable to answer. The cost of a false negative is one more
 * run's failures, which are now alerted anyway. The cost of a false positive is
 * a wedding's invitations not going out. */
export async function checkTemplate(
  cfg: WhatsAppConfig,
  templateName: string,
): Promise<string | null> {
  const waba = process.env.WHATSAPP_WABA_ID;
  if (!waba) return null;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${waba}/message_templates`
        + `?name=${encodeURIComponent(templateName)}&limit=10`,
      { signal: AbortSignal.timeout(8_000),
        headers: { Authorization: `Bearer ${cfg.accessToken}` } },
    );
    if (!res.ok) return null;

    const json = await res.json().catch(() => null);
    const rows = Array.isArray(json?.data) ? json.data : null;
    if (!rows) return null;

    /* Name is a filter, not a key: one name can hold several languages, and we
       send in exactly one. Matching the language too avoids judging our send
       against a translation nobody uses. */
    const stored = rows.find((t: { name?: string; language?: string }) =>
      t?.name === templateName && t?.language === cfg.templateLang) ?? null;

    /* Present but not in our language is a real, sendable-looking fault, and
       one an empty result would hide. */
    if (!stored && rows.length > 0) {
      return `התבנית ${templateName} לא קיימת בשפה ${cfg.templateLang}`;
    }

    /* Measured from the same builder the sender uses, with a filled details
       object because that is the path every event with details takes — the
       one that carries four parameters. */
    const sending = shapeOfOutgoing(invitationComponents(
      templateName, "https://example.com/i.jpg", "token",
      { couple: "א", date: "ב", venue: "ג", times: "ד" },
    ));

    return templateProblem(templateName, stored, sending);
  } catch {
    return null;
  }
}
