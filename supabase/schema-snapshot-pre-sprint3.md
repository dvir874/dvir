# Schema Snapshot — Staging DB (tunmwtaiskzmezlhpxij)
# Generated: 2026-06-25T21:40:54Z
# Tables: 36

## activity_log (5 cols)
  - id: uuid
  - event_id: uuid
  - action: text
  - details: jsonb
  - created_at: timestamp with time zone

## approval_requests (7 cols)
  - id: uuid
  - event_id: uuid
  - version_name: text
  - status: text
  - client_comment: text
  - approved_at: timestamp with time zone
  - created_at: timestamp with time zone

## automation_logs (6 cols)
  - id: uuid
  - event_id: uuid
  - action: text
  - result: text
  - metadata: jsonb
  - created_at: timestamp with time zone

## automation_rules (7 cols)
  - id: uuid
  - name: text
  - enabled: boolean
  - trigger_type: text
  - conditions_json: jsonb
  - actions_json: jsonb
  - created_at: timestamp with time zone

## budget_items (8 cols)
  - id: uuid
  - event_id: uuid
  - category: text
  - description: text
  - planned_amount: integer
  - actual_amount: integer
  - notes: text
  - created_at: timestamp with time zone

## chat_messages (7 cols)
  - id: uuid
  - event_id: uuid
  - sender: text
  - body: text
  - read_by_admin: boolean
  - read_by_couple: boolean
  - created_at: timestamp with time zone

## coupons (9 cols)
  - id: uuid
  - code: text
  - discount_pct: integer
  - description: text
  - created_by_event_id: uuid
  - used_by_event_id: uuid
  - used_at: timestamp with time zone
  - expires_at: timestamp with time zone
  - created_at: timestamp with time zone

## event_announcements (4 cols)
  - id: uuid
  - event_id: uuid
  - message: text
  - created_at: timestamp with time zone

## events (21 cols)
  - id: uuid
  - name: text
  - date: date
  - address: text
  - couple_token: text
  - theme: text
  - status: text
  - event_type: text
  - venue_name: text
  - client_name: text
  - client_phone: text
  - client_email: text
  - notes: text
  - onboarding_completed: boolean
  - onboarding_style: text
  - onboarding_fears: text[]
  - onboarding_moment: text
  - onboarding_manager: text
  - guest_count_estimate: integer
  - budget_estimate: integer
  - created_at: timestamp with time zone

## gallery_albums (7 cols)
  - id: uuid
  - event_id: uuid
  - title: text
  - public_token: text
  - is_public: boolean
  - photo_count: integer
  - created_at: timestamp with time zone

## gallery_photos (8 cols)
  - id: uuid
  - album_id: uuid
  - event_id: uuid
  - storage_path: text
  - public_url: text
  - caption: text
  - uploaded_by: text
  - created_at: timestamp with time zone

## gifts (8 cols)
  - id: uuid
  - event_id: uuid
  - guest_id: uuid
  - guest_name: text
  - amount: integer
  - notes: text
  - received_at: date
  - created_at: timestamp with time zone

## guest_campaigns (11 cols)
  - id: uuid
  - event_id: uuid
  - type: text
  - status: text
  - mode: text
  - scheduled_for: timestamp with time zone
  - sent_at: timestamp with time zone
  - recipients_total: integer
  - recipients_sent: integer
  - created_at: timestamp with time zone
  - updated_at: timestamp with time zone

## guest_events (4 cols)
  - id: uuid
  - guest_id: uuid
  - event_type: text
  - created_at: timestamp with time zone

## guest_relationships (7 cols)
  - id: uuid
  - event_id: uuid
  - guest_id_a: uuid
  - guest_id_b: uuid
  - type: text
  - notes: text
  - created_at: timestamp with time zone

## guest_tags (5 cols)
  - id: uuid
  - guest_id: uuid
  - event_id: uuid
  - tag: text
  - created_at: timestamp with time zone

## guests (13 cols)
  - id: uuid
  - event_id: uuid
  - name: text
  - phone: text
  - guest_count: integer
  - status: text
  - rsvp_token: text
  - response_time: timestamp with time zone
  - opened_at: timestamp with time zone
  - meal_preference: text
  - meal_note: text
  - category: text
  - created_at: timestamp with time zone

## lead_activities (6 cols)
  - id: uuid
  - lead_id: uuid
  - type: text
  - content: text
  - metadata: jsonb
  - created_at: timestamp with time zone

## lead_tasks (7 cols)
  - id: uuid
  - lead_id: uuid
  - title: text
  - due_date: date
  - completed: boolean
  - priority: text
  - created_at: timestamp with time zone

## leads (16 cols)
  - id: uuid
  - name: text
  - phone: text
  - email: text
  - event_type: text
  - wedding_date: date
  - guest_count: integer
  - source: public.lead_source
  - ref_code: text
  - status: public.pipeline_stage
  - deal_value: integer
  - ai_score: integer
  - notes: text
  - converted_event_id: uuid
  - created_at: timestamp with time zone
  - updated_at: timestamp with time zone

## memory_items (12 cols)
  - id: uuid
  - event_id: uuid
  - vault_token: uuid
  - guest_name: text
  - guest_id: uuid
  - type: text
  - storage_path: text
  - public_url: text
  - blessing_text: text
  - file_size: bigint
  - mime_type: text
  - uploaded_at: timestamp with time zone

## message_history (9 cols)
  - id: uuid
  - campaign_id: uuid
  - event_id: uuid
  - guest_id: uuid
  - type: text
  - status: text
  - wa_link: text
  - sent_at: timestamp with time zone
  - created_at: timestamp with time zone

## message_templates (2 cols)
  - id: uuid
  - created_at: timestamp with time zone

## referral_clicks (3 cols)
  - id: uuid
  - code: text
  - clicked_at: timestamp with time zone

## referral_codes (4 cols)
  - id: uuid
  - code: text
  - event_id: uuid
  - created_at: timestamp with time zone

## satisfaction_surveys (5 cols)
  - id: uuid
  - event_id: uuid
  - score: integer
  - feedback: text
  - created_at: timestamp with time zone

## seating_assignments (6 cols)
  - id: uuid
  - event_id: uuid
  - guest_id: uuid
  - table_id: uuid
  - seat_number: integer
  - created_at: timestamp with time zone

## seating_tables (6 cols)
  - id: uuid
  - event_id: uuid
  - name: text
  - capacity: integer
  - notes: text
  - created_at: timestamp with time zone

## tasks (5 cols)
  - id: uuid
  - event_id: uuid
  - title: text
  - completed: boolean
  - created_at: timestamp with time zone

## time_capsule_messages (7 cols)
  - id: uuid
  - event_id: uuid
  - guest_id: uuid
  - message: text
  - deliver_at: date
  - delivered: boolean
  - created_at: timestamp with time zone

## vault_tokens (4 cols)
  - id: uuid
  - event_id: uuid
  - token: text
  - created_at: timestamp with time zone

## wedding_recaps (4 cols)
  - id: uuid
  - event_id: uuid
  - content: jsonb
  - created_at: timestamp with time zone

## wedding_score_snapshots (5 cols)
  - id: uuid
  - event_id: uuid
  - score: integer
  - snapshot: jsonb
  - created_at: timestamp with time zone

## wedding_tasks (7 cols)
  - id: uuid
  - event_id: uuid
  - title: text
  - status: text
  - due_date: date
  - category: text
  - created_at: timestamp with time zone

## wedding_vendor_contacts (8 cols)
  - id: uuid
  - event_id: uuid
  - category: text
  - name: text
  - phone: text
  - notes: text
  - confirmed: boolean
  - created_at: timestamp with time zone

## wedding_vendors (9 cols)
  - id: uuid
  - event_id: uuid
  - name: text
  - category: text
  - phone: text
  - price: integer
  - status: text
  - notes: text
  - created_at: timestamp with time zone

