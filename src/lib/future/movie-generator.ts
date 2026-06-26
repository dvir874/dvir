// Architecture stub for Wedding Memories Movie feature (future AI implementation)

export interface MoviePhoto {
  id: string;
  storage_path: string;
  orientation: "portrait" | "landscape" | "square";
  width_px: number;
  height_px: number;
  media_type: "photo" | "video";
  duration_sec?: number;
  is_favorite: boolean;
  uploaded_by_guest_name?: string;
  album_name?: string;
  created_at: string;
}

export interface MovieConfig {
  event_id: string;
  event_name: string;
  event_date: string;
  style: "romantic" | "cinematic" | "slideshow";
  duration_sec: number;
  music_track?: string;
  include_favorites_only: boolean;
}

export interface MovieOutput {
  status: "pending" | "processing" | "ready" | "failed";
  download_url?: string;
  preview_url?: string;
  created_at: string;
  expires_at?: string;
}

// TODO: implement via video generation service (Runway ML / Luma / ffmpeg + S3)
export async function generateWeddingMovie(_config: MovieConfig, _photos: MoviePhoto[]): Promise<MovieOutput> {
  throw new Error("Wedding Memories Movie generation is not yet implemented. Coming soon!");
}

// TODO: implement photo selection algorithm (diversity, quality, favorites first)
export function selectMoviePhotos(photos: MoviePhoto[], maxCount = 60): MoviePhoto[] {
  const favorites = photos.filter(p => p.is_favorite);
  const rest = photos.filter(p => !p.is_favorite);
  const selected = [...favorites, ...rest].slice(0, maxCount);
  // Prefer landscape for cinematic feel
  return selected.sort((a, b) =>
    (b.orientation === "landscape" ? 1 : 0) - (a.orientation === "landscape" ? 1 : 0)
  );
}
