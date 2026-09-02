-- When the couple asked us to send everyone their table number.
--
-- wedding_day_details_utility has been approved for weeks with a 🪑 שולחן {{5}}
-- slot and is wired to nothing. The only way to send a table number was a
-- button that opens one wa.me tab per guest — 229 tabs for שחר, each needing a
-- click, from the couple's personal WhatsApp, with every emoji arriving as a
-- replacement character.
--
-- A timestamp rather than a boolean: the send goes out through the cron in
-- budget-sized batches like everything else, and the couple needs to be able
-- to ask again after they move somebody.
ALTER TABLE events ADD COLUMN IF NOT EXISTS tables_send_requested_at timestamptz;

COMMENT ON COLUMN events.tables_send_requested_at IS
  'When the couple asked to send table numbers. The cron sends to seated guests not yet told, then leaves it set.';
