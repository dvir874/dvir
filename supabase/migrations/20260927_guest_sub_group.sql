-- One level of refinement under the group a guest already belongs to.
--
-- ישורון asked for it after running his daughter's wedding: "להוסיף אפשרות
-- להוספת תת קבוצה", and separately "להוסיף אפשרות לסינון לפי תת קבוצה" on the
-- wall of seventy-two unseated names.
--
-- One level, and free text, because the couples are already doing this by hand
-- and no two of them do it the same way:
--
--   איילת    משפחה קרובה / משפחה מורחבת      the parent leads
--   לאל וטל  חברים ישורון / מילואים ישורון   the parent trails
--            שפירא / שפירא דודים             the parent stands alone
--
-- A parent_id tree, or a rule that splits the existing names, would force all
-- three into a shape none of them chose. The group stays exactly the string
-- the couple typed; this column holds the refinement beside it, and stays null
-- for the wedding that never wants one.
--
-- Nothing is backfilled. "חברים ישורון" remains one group, because deciding on
-- their behalf that "ישורון" is the parent and "חברים" the child is rewriting
-- their own vocabulary for them — and לאל וטל's other pair proves the guess
-- would be wrong half the time.

alter table guests add column if not exists sub_group text;

-- The two reads that exist: the filter on the seating screen, and the chips
-- offered in the guest sheet. Both ask for one event's sub-groups at a time.
create index if not exists guests_event_sub_group_idx
  on guests (event_id, sub_group) where sub_group is not null;
