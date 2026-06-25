import { z } from 'zod';

// ── RSVP ────────────────────────────────────────────────────────────────────

export const RsvpSchema = z.object({
  attending:     z.enum(['yes', 'no']),
  guest_name:    z.string().min(1).max(200).trim(),
  phone:         z.string().max(20).optional().nullable(),
  meal_choice:   z.string().max(100).optional().nullable(),
  plus_one:      z.boolean().optional().nullable(),
  plus_one_name: z.string().max(200).optional().nullable(),
  notes:         z.string().max(1000).optional().nullable(),
  transportation: z.boolean().optional().nullable(),
});
export type RsvpInput = z.infer<typeof RsvpSchema>;

// ── Leads ───────────────────────────────────────────────────────────────────

export const LeadCreateSchema = z.object({
  name:         z.string().min(1).max(200).trim(),
  phone:        z.string().min(7).max(20).trim(),
  email:        z.string().email().max(200).optional().nullable(),
  event_type:   z.string().max(100).optional().nullable(),
  wedding_date: z.string().max(20).optional().nullable(),
  guest_count:  z.number().int().min(1).max(5000).optional().nullable(),
  source:       z.string().max(100).optional().nullable(),
  ref_code:     z.string().max(100).optional().nullable(),
  notes:        z.string().max(2000).optional().nullable(),
});
export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;

// ── Guests ──────────────────────────────────────────────────────────────────

export const GuestCreateSchema = z.object({
  event_id:   z.string().uuid(),
  name:       z.string().min(1).max(200).trim(),
  phone:      z.string().max(20).optional().nullable(),
  email:      z.string().email().max(200).optional().nullable(),
  group_name: z.string().max(100).optional().nullable(),
  table_name: z.string().max(100).optional().nullable(),
  side:       z.enum(['bride', 'groom', 'both', 'other']).optional().nullable(),
  rsvp_status: z.enum(['pending', 'attending', 'not_attending', 'maybe']).optional().nullable(),
  meal_choice: z.string().max(100).optional().nullable(),
  notes:       z.string().max(1000).optional().nullable(),
  is_plus_one: z.boolean().optional().nullable(),
  transportation: z.boolean().optional().nullable(),
});
export type GuestCreateInput = z.infer<typeof GuestCreateSchema>;

export const GuestPatchSchema = GuestCreateSchema.partial().omit({ event_id: true });
export type GuestPatchInput = z.infer<typeof GuestPatchSchema>;

// ── Budget ──────────────────────────────────────────────────────────────────

export const BudgetItemCreateSchema = z.object({
  event_id:    z.string().uuid(),
  category:    z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  amount:      z.number().nonnegative(),
  paid:        z.boolean().optional().nullable(),
  notes:       z.string().max(500).optional().nullable(),
  vendor_name: z.string().max(200).optional().nullable(),
  due_date:    z.string().max(20).optional().nullable(),
});
export type BudgetItemCreateInput = z.infer<typeof BudgetItemCreateSchema>;

export const BudgetItemPatchSchema = BudgetItemCreateSchema.partial().omit({ event_id: true });
export type BudgetItemPatchInput = z.infer<typeof BudgetItemPatchSchema>;

// ── Helper ──────────────────────────────────────────────────────────────────

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { data: null, error: msg };
  }
  return { data: result.data, error: null };
}
