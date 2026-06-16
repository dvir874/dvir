/**
 * Scheduler Foundation
 *
 * Defines the contract for scheduled automation jobs.
 * No jobs run automatically yet — this is the type scaffold only.
 *
 * Deployment path:
 *   1. Vercel Cron: add cron section to vercel.json, call /api/cron/daily
 *   2. Supabase pg_cron: call Edge Function via pg_cron
 *   3. External scheduler (e.g., Inngest, Trigger.dev): implement JobHandler
 *
 * The /api/cron/ routes act as HTTP entry points for external schedulers.
 * They MUST be protected with CRON_SECRET env var in production.
 */

export type JobFrequency = "hourly" | "daily" | "weekly";

export interface ScheduledJob {
  id:        string;
  name:      string;
  frequency: JobFrequency;
  enabled:   boolean;
  handler:   JobHandler;
  lastRun?:  string;
  nextRun?:  string;
}

// Handler contract — implement this to create a new scheduled job
export type JobHandler = (context: JobContext) => Promise<JobResult>;

export interface JobContext {
  runAt:     string;       // ISO timestamp
  dryRun:    boolean;      // true = compute but don't write
  eventIds?: string[];     // scope to specific events; undefined = all
}

export interface JobResult {
  success:    boolean;
  processed:  number;
  tasksCreated: number;
  errors:     string[];
  summary:    string;
}

// ── Built-in job definitions ───────────────────────────────
// These are REGISTERED but not yet EXECUTED.
// Wire them to /api/cron/daily to activate.

export const JOB_IDS = {
  DAILY_TASK_GENERATION:   "daily-task-generation",
  DAILY_HEALTH_CHECK:      "daily-health-check",
  HOURLY_RESPONSE_MONITOR: "hourly-response-monitor",
} as const;

// Registry: maps job ID to metadata (handler injected at runtime)
export const JOB_REGISTRY: Omit<ScheduledJob, "handler">[] = [
  {
    id:        JOB_IDS.DAILY_TASK_GENERATION,
    name:      "Daily Task Generation",
    frequency: "daily",
    enabled:   true,
  },
  {
    id:        JOB_IDS.DAILY_HEALTH_CHECK,
    name:      "Daily Event Health Check",
    frequency: "daily",
    enabled:   true,
  },
  {
    id:        JOB_IDS.HOURLY_RESPONSE_MONITOR,
    name:      "Hourly Response Rate Monitor",
    frequency: "hourly",
    enabled:   false, // enable when needed
  },
];
