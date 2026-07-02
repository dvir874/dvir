-- Ride-sharing board: where the guest travels from + offering/seeking a ride
ALTER TABLE guests ADD COLUMN IF NOT EXISTS ride_from TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS ride_role TEXT; -- 'offer' | 'seek' | null
