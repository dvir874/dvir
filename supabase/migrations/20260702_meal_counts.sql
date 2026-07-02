-- Per-guest meal breakdown for multi-guest RSVPs
-- e.g. {"regular": 2, "vegetarian": 1, "kids": 1}
ALTER TABLE guests ADD COLUMN IF NOT EXISTS meal_counts JSONB DEFAULT '{}'::jsonb;
