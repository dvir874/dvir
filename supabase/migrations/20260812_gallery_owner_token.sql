-- A link for the couple that is not the link anyone else could hold.
--
-- gallery_albums.is_public exists, the API selects it, and nothing has ever
-- checked it. The live album is marked is_public = false and serves its photos
-- to anyone holding the token regardless — a flag that describes an intention
-- nobody enforces is worse than no flag, because it reads as a protection that
-- is not there.
--
-- Enforcing it alone would lock the couple out too: there was only ever one
-- token, so "private" and "nobody can see it, including you" were the same
-- thing. Hence two:
--
--   public_token  what a guest would use. Honours is_public.
--   owner_token   the couple's own. Always works, and is the only link that
--                 should ever be sent to them.
--
-- This matters more now than it did yesterday. Guests are no longer sent to
-- the gallery at all — they get /memory to upload — so the viewing gallery is
-- the couple's private space, and the product should be able to say that and
-- mean it.
--
-- Additive and idempotent — safe on the live database. Existing albums get an
-- owner_token; nothing that works today stops working.

create extension if not exists pgcrypto;

alter table gallery_albums
  add column if not exists owner_token uuid not null default gen_random_uuid();

comment on column gallery_albums.owner_token is
  'הקישור הפרטי של הזוג לצפייה בגלריה — עוקף is_public. לא לשלוח לאורחים';

create unique index if not exists gallery_albums_owner_token_uniq
  on gallery_albums (owner_token);
