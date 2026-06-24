export type GuestStatus = 'pending' | 'confirmed' | 'declined';

export type EventStatus =
  | 'draft'
  | 'waiting_approval'
  | 'approved'
  | 'ready_for_invitations'
  | 'invitations_sent'
  | 'rsvp_active'
  | 'completed';

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  draft:                 'טיוטה',
  waiting_approval:      'ממתין לאישור',
  approved:              'אושר',
  ready_for_invitations: 'מוכן לשליחה',
  invitations_sent:      'הזמנות נשלחו',
  rsvp_active:           'RSVP פעיל',
  completed:             'הושלם',
};

export const EVENT_STATUS_COLOR: Record<EventStatus, string> = {
  draft:                 'rgba(150,150,150,0.75)',
  waiting_approval:      'rgba(197,164,109,0.90)',
  approved:              'rgba(107,123,90,0.90)',
  ready_for_invitations: 'rgba(59,130,246,0.85)',
  invitations_sent:      'rgba(147,51,234,0.85)',
  rsvp_active:           'rgba(34,197,94,0.90)',
  completed:             'rgba(107,123,90,0.55)',
};

export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

export interface ApprovalRequest {
  id: string;
  event_id: string;
  version_name: string;
  status: ApprovalStatus;
  client_comment?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface Forecast {
  confirmedAttendees: number;
  responseRate: number;
  confirmRate: number;
  pendingGuests: number;
  optimistic: number;
  expected: number;
  conservative: number;
  hasEnoughData: boolean;
}

export interface HealthScore {
  score: number;
  tier: "green" | "yellow" | "red";
  label: string;
  breakdown: { factor: string; points: number; max: number }[];
}

export type ActivityEventType =
  | 'invitation_sent'
  | 'reminder_sent'
  | 'rsvp_opened'
  | 'rsvp_submitted';

export interface GuestEvent {
  id: string;
  event_type: ActivityEventType;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  address?: string | null;
  couple_token?: string | null;
  theme?: string | null;
  status?: EventStatus | null;
  event_type?: string | null;
  venue_name?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  notes?: string | null;
  created_at: string;
  payment_status?: string | null;
  payment_amount?: number | null;
  payment_date?: string | null;
  rsvp_deadline?: string | null;
}

export interface EventSummary {
  id: string; name: string; date: string; address?: string | null;
  couple_token?: string | null;
  status?: EventStatus | null;
  client_name?: string | null;
  client_phone?: string | null;
  event_type?: string | null;
  total: number; confirmed: number; declined: number; pending: number;
  attendees: number; responseRate: number; openedCount: number;
  openedPending: number; noPhone: number;
  healthScore: number; healthTier: "green" | "yellow" | "red";
  recentActivity: number; daysUntilEvent: number; needsAttention: boolean;
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  guest_count: number;
  status: GuestStatus;
  response_time: string | null;
  opened_at: string | null;
  rsvp_token: string;
  created_at: string;
  meal_preference?: string | null;
  meal_note?: string | null;
  category?: string | null;
}

export type MealPreference = 'regular' | 'vegetarian' | 'vegan' | 'mehadrin';

export const MEAL_PREFERENCE_LABEL: Record<string, string> = {
  regular: 'רגיל',
  vegetarian: 'צמחוני',
  vegan: 'טבעוני',
  mehadrin: 'כשר מהדרין',
};

export interface SeatingTable {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  type: 'round' | 'rectangular' | 'custom';
  sort_order: number;
  pos_x?: number;
  pos_y?: number;
  notes?: string | null;
  created_at: string;
  assignments?: SeatingAssignment[];
}

export interface SeatingAssignment {
  id: string;
  table_id: string;
  guest_id: string;
  event_id: string;
  created_at: string;
  guest?: Guest;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  description: string;
  planned_amount: number;
  actual_amount: number | null;
  notes: string | null;
  created_at: string;
}

export interface Gift {
  id: string;
  event_id: string;
  guest_id: string | null;
  guest_name: string;
  amount: number;
  notes: string | null;
  received_at: string | null;
  created_at: string;
}
