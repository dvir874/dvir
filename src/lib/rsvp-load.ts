import { createServerClient } from "@/lib/supabase-server";

/* Read-only load of everything the RSVP page needs to render.
 *
 * Deliberately without side effects, and that is the whole point of it being
 * separate from the API route. The route marks opened_at and resets demo
 * guests; if the server-rendered page did the same, WhatsApp's link-preview
 * crawler would mark every guest as having opened their invitation the moment
 * the message was delivered, and the one honest signal we have about who
 * actually looked would be destroyed.
 *
 * So: the server renders from this, the browser still calls the API, and only
 * a real browser marks an open. Rendering no longer waits on that call — which
 * is the bug this exists to remove. A guest reported the page "just stayed on
 * the waiting screen" on three devices; the fetch had a catch but no timeout,
 * and a request that never settles never rejects.
 */

export interface RsvpData {
  guest: Record<string, unknown>;
  event: Record<string, unknown> | null;
  tableName: string | null;
  memoryToken: string | null;
}

/* "no such guest" and "the read failed" are different answers and the page
   should act differently on each: the first is a dead link and can say so at
   once, the second is our problem and the client should retry. Collapsing both
   to null made an invalid link sit on the loading screen waiting for a fetch
   whose answer the server already knew. */
export type RsvpLoad =
  | { kind: "ok"; data: RsvpData }
  | { kind: "not_found" }
  | { kind: "unavailable" };

/* Nothing here may take longer than this.

   The whole point of moving the read to the server was that a request which
   never settles never rejects. Moving it did not remove that risk, it relocated
   it: supabase-js carries no default timeout, this function makes up to five
   sequential round-trips, and the page awaits all of them before a single byte
   of HTML is produced. A slow Supabase therefore gave the guest a blank tab and
   eventually Vercel's own error page — in English, with no invitation and no
   way back. Four seconds, then we render the page and let the client retry. */
const LOAD_TIMEOUT_MS = 4_000;

function withTimeout<T>(work: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), LOAD_TIMEOUT_MS)),
  ]);
}

export async function loadRsvp(token: string): Promise<RsvpLoad> {
  return withTimeout(loadRsvpInner(token), { kind: "unavailable" });
}

async function loadRsvpInner(token: string): Promise<RsvpLoad> {
  let sb: ReturnType<typeof createServerClient>;
  try {
    sb = createServerClient();
  } catch {
    /* Missing env vars — our problem, not a dead link */
    return { kind: "unavailable" };
  }

  try {
    const { data: guest, error } = await sb
      .from("guests")
      .select("id, name, guest_count, status, event_id, opened_at, source_group, category, meal_preference, meal_note, wants_photos, ride_from, ride_role")
      .eq("rsvp_token", token)
      .maybeSingle();

    /* The distinction this whole module exists to make, and the one the old
       code threw away by discarding `error` and collapsing everything to null.
       An error is OUR failure — an expired service key, a dropped connection,
       a column renamed under us, an RLS change — and the guest should be asked
       to try again. Zero rows is a dead link and can be said immediately.
       Treating the first as the second is how a Supabase hiccup told a guest
       holding a perfectly valid invitation that it does not exist, and then
       disabled the client-side retry that was supposed to save them. */
    if (error) return { kind: "unavailable" };
    if (!guest) return { kind: "not_found" };

    /* Everything below the guest row is decoration. A missing event, table or
       memory token is worth rendering the invitation without — never worth
       refusing to show it. Only the guest lookup can make this unavailable. */
    const [{ data: event }, { data: vault }, { data: assignment }] = await Promise.all([
      sb.from("events")
        /* couple_names belongs here, not only on the API route. When the server
         renders the page RsvpClient discards the API response entirely —
         deliberately, so a slow GET cannot overwrite an answer the guest just
         gave — so this select is the ONLY source of `event` in production, and
         adding a field to the route alone changes nothing a guest ever sees. */
      .select("name, couple_names, date, address, venue_name, theme, mini_site_hero_path, wa_header_image_url, rsvp_bg, reception_time, chuppah_time, bit_phone, paybox_link")
        .eq("id", guest.event_id).maybeSingle(),
      sb.from("vault_tokens").select("token").eq("event_id", guest.event_id).maybeSingle(),
      sb.from("seating_assignments").select("table_id").eq("guest_id", guest.id).maybeSingle(),
    ]);

    let tableName: string | null = null;
    if (assignment?.table_id) {
      const { data: table } = await sb
        .from("seating_tables").select("name").eq("id", assignment.table_id).maybeSingle();
      tableName = table?.name ?? null;
    }

    return {
      kind: "ok",
      data: { guest, event: event ?? null, tableName, memoryToken: vault?.token ?? null },
    };
  } catch {
    return { kind: "unavailable" };
  }
}

/** Kept for callers that only care whether there is data. */
export async function loadRsvpData(token: string): Promise<RsvpData | null> {
  const r = await loadRsvp(token);
  return r.kind === "ok" ? r.data : null;
}
