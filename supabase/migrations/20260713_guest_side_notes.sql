-- Optional backwards-compatible fields used by couple guest editing + ops center
ALTER TABLE guests ADD COLUMN IF NOT EXISTS side TEXT;   -- 'bride' | 'groom' | null
ALTER TABLE guests ADD COLUMN IF NOT EXISTS notes TEXT;
