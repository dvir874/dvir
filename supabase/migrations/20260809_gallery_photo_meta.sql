-- Columns the gallery upload route has always written but the table never had.
--
-- The mismatch meant every guest upload returned "Internal server error":
-- storage accepted the file, then the metadata insert failed and the photo
-- was orphaned. Nothing surfaced this because the error was swallowed into a
-- generic 500.
--
-- Additive and idempotent — safe on the live database.

alter table gallery_photos add column if not exists uploader_name text;
alter table gallery_photos add column if not exists mime_type     text;
alter table gallery_photos add column if not exists file_size     bigint;
alter table gallery_photos add column if not exists is_video      boolean not null default false;

comment on column gallery_photos.uploader_name is 'שם האורח שהעלה — מוצג מתחת לתמונה בגלריה';
