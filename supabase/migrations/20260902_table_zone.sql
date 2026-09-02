-- Which part of the hall a table stands in.
--
-- ארץ האיילים sent שחר's plan on 02/09: 26 numbered tables across מפלס א,
-- מפלס ב, מפלס ג and the floor by the bar, each with its own capacity — all 12
-- except table 24, which is 10. The room is a given, not something a seating
-- engine gets to invent, and the engine had been inventing 37 tables for a hall
-- that holds 26.
--
-- The zone is what makes "keep this family together" mean something physical:
-- a group split across two tables in the same מפלס is sitting together, and the
-- same split across two floors is not.
ALTER TABLE seating_tables ADD COLUMN IF NOT EXISTS zone text;

COMMENT ON COLUMN seating_tables.zone IS
  'The area of the hall this table stands in, from the venue plan. NULL = one undivided room.';
