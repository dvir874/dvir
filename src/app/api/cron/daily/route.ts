/**
 * Daily Cron Entry Point
 *
 * Called by an external scheduler (Vercel Cron, pg_cron, etc.) once per day.
 * MUST be protected by CRON_SECRET in production.
 *
 * Current behaviour: dry-run only — computes tasks and health scores
 * but does NOT send messages or mutate data.
 *
 * To activate mutations:
 *   1. Set CRON_ENABLED=true in env
 *   2. Implement the task persistence calls below
 *   3. Wire to Vercel Cron in vercel.json
 *
 * vercel.json example:
 *   { "crons": [{ "path": "/api/cron/daily", "schedule": "0 8 * * *" }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@/lib/supabase-server";
import { generateTasks }             from "@/lib/automation/task-engine";
import { computeEventHealth }        from "@/lib/automation/health";
import { JOB_IDS }                   from "@/lib/automation/scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Auth guard — always required in production
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      console.error("[cron/daily] CRON_SECRET env var not set — refusing to run");
      return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
    }
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (secret && authHeader !== `Bearer ${secret}`) {
    // In dev, only enforce if secret is set
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dry") !== "false";
  const supabase = createServerClient();
  const now = Date.now();

  // Fetch all active events
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, date, address")
    .gte("date", new Date(now - 86_400_000).toISOString().split("T")[0]); // today or future

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!events?.length) return NextResponse.json({ jobId: JOB_IDS.DAILY_TASK_GENERATION, processed: 0, dryRun });

  // Fetch all guests for these events
  const { data: allGuests } = await supabase
    .from("guests")
    .select("id, event_id, status, guest_count, phone, opened_at, response_time")
    .in("event_id", events.map((e) => e.id));

  const guestsByEvent: Record<string, typeof allGuests> = {};
  (allGuests ?? []).forEach((g) => {
    if (!guestsByEvent[g.event_id]) guestsByEvent[g.event_id] = [];
    guestsByEvent[g.event_id]!.push(g);
  });

  // Build context for each event
  const contexts = events.map((ev) => {
    const guests = guestsByEvent[ev.id] ?? [];
    const total     = guests.length;
    const confirmed = guests.filter((g) => g.status === "confirmed");
    const declined  = guests.filter((g) => g.status === "declined").length;
    const pending   = guests.filter((g) => g.status === "pending").length;
    const responders = confirmed.length + declined;
    const attendees  = confirmed.reduce((s, g) => s + g.guest_count, 0);
    const responseRate = total > 0 ? Math.round((responders / total) * 100) : 0;
    const openedCount  = guests.filter((g) => g.opened_at).length;
    const openedPending = guests.filter((g) => g.opened_at && g.status === "pending").length;
    const noPhone      = guests.filter((g) => !g.phone).length;
    const recentActivity = guests.filter(
      (g) => g.response_time && now - new Date(g.response_time).getTime() < 7 * 86_400_000
    ).length;
    const daysUntilEvent = Math.ceil((new Date(ev.date).getTime() - now) / 86_400_000);
    const pendingPct     = total > 0 ? pending / total : 1;

    const health = computeEventHealth({
      total, confirmed: confirmed.length, declined, pending,
      openedCount, responseRate, daysUntilEvent, recentActivity,
    });

    return {
      id: ev.id, name: ev.name, date: ev.date,
      total, confirmed: confirmed.length, declined, pending,
      attendees, responseRate, openedCount, openedPending, noPhone,
      healthTier: health.tier, recentActivity, daysUntilEvent,
      pendingPercent: Math.round(pendingPct * 100),
    };
  });

  const tasks = generateTasks(contexts);

  // TODO (when CRON_ENABLED=true): persist tasks to `tasks` table
  // if (!dryRun && process.env.CRON_ENABLED === "true") {
  //   await supabase.from("tasks").insert(tasks.map(t => ({ ... })));
  // }

  return NextResponse.json({
    jobId:        JOB_IDS.DAILY_TASK_GENERATION,
    runAt:        new Date().toISOString(),
    dryRun,
    processed:    events.length,
    tasksGenerated: tasks.length,
    tasks:        tasks.map((t) => ({ eventName: t.eventName, priority: t.priority, title: t.title })),
  });
}
