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

export async function loadRsvpData(token: string): Promise<RsvpData | null> {
  try {
    const sb = createServerClient();

    const { data: guest } = await sb
      .from("guests")
      .select("id, name, guest_count, status, event_id, opened_at, source_group, category, meal_preference, meal_note, wants_photos, ride_from, ride_role")
      .eq("rsvp_token", token)
      .maybeSingle();
    if (!guest) return null;

    const [{ data: event }, { data: vault }, { data: assignment }] = await Promise.all([
      sb.from("events")
        .select("name, date, address, venue_name, theme, mini_site_hero_path, bit_phone, paybox_link")
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

    return { guest, event: event ?? null, tableName, memoryToken: vault?.token ?? null };
  } catch {
    /* Fail to null, never throw. The client keeps its own fetch as a fallback,
       so a hiccup here costs a slower first paint — not a broken invitation. */
    return null;
  }
}
