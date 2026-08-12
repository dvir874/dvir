-- gallery_albums is readable by anyone holding the publishable key.
--
-- Supabase has been mailing a CRITICAL advisory about this every week since
-- June: rls_disabled_in_public on project regalifnei. Verified against
-- production with the publishable key — the one compiled into every browser
-- bundle and therefore public by definition:
--
--   guests, events, wa_messages, memory_items, vault_tokens, guest_events →
--     return zero rows. RLS is on and no policy grants anon a read.
--   gallery_albums → returns every column of every row, including owner_token.
--
-- owner_token is the couple's private viewing link, added yesterday so that
-- guests could upload to a gallery without being able to browse it. The API
-- enforces that correctly; the table hands out the key anyway. A lock the
-- database will open for anyone who asks is not a lock.
--
-- Enabling RLS with no policy is the right shape here, not an oversight. Every
-- one of the seven files that touches this table is a server route using the
-- service-role key, which bypasses RLS entirely — verified, none is a client
-- component. So the app keeps working exactly as it does now, and the anon key
-- stops being able to read the table at all, which matches every other table in
-- the schema.

alter table gallery_albums enable row level security;

comment on table gallery_albums is
  'RLS מופעל ללא policy בכוונה: כל הקריאות עוברות דרך route בשרת עם service-role. owner_token הוא הקישור הפרטי של הזוג ואסור שייקרא מהדפדפן';
