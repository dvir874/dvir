-- 014: Gallery storage bucket and schema updates

-- Add uploader_name to gallery_photos
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS uploader_name text DEFAULT 'אורח';
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS file_size bigint DEFAULT 0;
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS mime_type text DEFAULT 'image/jpeg';
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS is_video boolean DEFAULT false;

-- Add status to gallery_albums (open = accepting uploads, closed = no more uploads)
ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS status text DEFAULT 'open' CHECK (status IN ('open', 'closed'));
ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS event_name text DEFAULT '';

-- Create storage bucket for gallery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  false,
  52428800,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','video/mov']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can upload (token verified at app level)
DO $$ BEGIN
  CREATE POLICY "public_upload_gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role can read/delete
DO $$ BEGIN
  CREATE POLICY "service_read_gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_delete_gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
