-- Where a table sits in the hall.
--
-- SeatingFloorPlan.tsx has had a working drag since it was written: it tracks
-- a pointer, moves the table, and calls onMoveTable. The seating page wires
-- that to PATCH /api/couple/[token]/seating/[tableId] with { pos_x, pos_y }.
-- Every part of the feature exists except these two columns, so the write has
-- always failed and every position has always been lost on reload.
--
-- ישורון managed his daughter's wedding through this screen and reported it
-- exactly as it behaves: "אצלי בטלפון אין אפשרות להזיז (גם במחשב לא הצלחתי)".
-- On a phone there were no touch handlers at all — that half is fixed in the
-- component. On a desktop the drag worked and the result vanished, which is
-- indistinguishable from it not working.
--
-- Nullable with no default on purpose: a table that has never been dragged
-- keeps falling back to defaultPos(index), the tidy grid the component lays
-- out on its own. Only a table somebody actually placed carries a position.

alter table seating_tables add column if not exists pos_x double precision;
alter table seating_tables add column if not exists pos_y double precision;
