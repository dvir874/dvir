"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera, Upload, CheckCircle2, Loader2, X, Video, Image as ImageIcon, AlertCircle } from "lucide-react";

const G = {
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  dark:   "#333333",
  border: "rgba(197,164,109,0.18)",
};
const HEEBO = { fontFamily: "Heebo, sans-serif" } as const;
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" } as const;

interface AlbumInfo {
  id: string;
  title: string;
  event_name: string;
  status: string;
  photo_count: number;
}

interface FileItem {
  id: string;
  file: File;
  preview: string | null;
  isVideo: boolean;
  progress: number;   // 0–100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

// Client-side image compression using canvas
async function compressImage(file: File, maxSizeMB = 3): Promise<File> {
  if (file.type.startsWith("video/")) return file;
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const maxDim = 2400;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else                { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", 0.82);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export default function GalleryUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const [token,       setToken]       = useState<string>("");
  const [album,       setAlbum]       = useState<AlbumInfo | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [closed,      setClosed]      = useState(false);
  const [uploaderName,setUploaderName]= useState("");
  const [nameSet,     setNameSet]     = useState(false);
  const [files,       setFiles]       = useState<FileItem[]>([]);
  const [allDone,     setAllDone]     = useState(false);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const cameraRef     = useRef<HTMLInputElement>(null);

  // Resolve params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Fetch album info
  useEffect(() => {
    if (!token) return;
    fetch(`/api/gallery/${token}`)
      .then((r) => r.json())
      .then((d: { album?: AlbumInfo; error?: string }) => {
        if (d.error || !d.album) { setNotFound(true); }
        else if (d.album.status === "closed") { setClosed(true); setAlbum(d.album); }
        else { setAlbum(d.album); }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => {
      const ok = f.type.startsWith("image/") || f.type.startsWith("video/");
      return ok && f.size < 200 * 1024 * 1024; // 200MB max
    });
    const items: FileItem[] = valid.map((f) => ({
      id:       `${Date.now()}-${Math.random()}`,
      file:     f,
      preview:  f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      isVideo:  f.type.startsWith("video/"),
      progress: 0,
      status:   "pending",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const uploadAll = useCallback(async () => {
    if (!token || !nameSet) return;
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    for (const item of pending) {
      // Mark uploading
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "uploading", progress: 5 } : f));

      try {
        const compressed = await compressImage(item.file);

        // Simulate progress while uploading (XHR gives real progress; fetch doesn't)
        const progressInterval = setInterval(() => {
          setFiles((prev) => prev.map((f) => f.id === item.id && f.progress < 80 ? { ...f, progress: f.progress + 8 } : f));
        }, 300);

        const fd = new FormData();
        fd.append("file", compressed, compressed.name);
        fd.append("uploader_name", uploaderName);

        const res = await fetch(`/api/gallery/${token}/upload`, { method: "POST", body: fd });
        clearInterval(progressInterval);

        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "error", progress: 0, error: err.error ?? "שגיאה" } : f));
        } else {
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "done", progress: 100 } : f));
        }
      } catch {
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "error", progress: 0, error: "שגיאת רשת" } : f));
      }
    }

    setAllDone(true);
  }, [token, files, uploaderName, nameSet]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  // ——— Render states ———

  if (loading) return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: G.ivory }}>
      <Loader2 size={32} className="animate-spin" style={{ color: G.gold }} />
    </div>
  );

  if (notFound) return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: G.ivory }}>
      <AlertCircle size={48} style={{ color: G.gold }} className="mb-4" />
      <h1 className="text-xl font-bold mb-2" style={{ color: G.dark, ...FRANK }}>הקישור אינו תקין</h1>
      <p className="text-sm" style={{ color: "rgba(51,51,51,0.5)", ...HEEBO }}>ייתכן שהקישור פג תוקף או שגוי.</p>
    </div>
  );

  if (closed && album) return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: G.ivory }}>
      <span className="text-5xl mb-4">📸</span>
      <h1 className="text-xl font-bold mb-2" style={{ color: G.dark, ...FRANK }}>{album.event_name}</h1>
      <p className="text-sm mb-1" style={{ color: G.gold, ...HEEBO }}>הגלריה נסגרה</p>
      <p className="text-sm" style={{ color: "rgba(51,51,51,0.5)", ...HEEBO }}>ההעלאות לאלבום הסתיימו. תודה!</p>
    </div>
  );

  // All uploads done — thank you screen
  if (allDone && files.every((f) => f.status === "done" || f.status === "error")) {
    const doneCount  = files.filter((f) => f.status === "done").length;
    const errorCount = files.filter((f) => f.status === "error").length;
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: G.ivory }}>
        <div className="text-6xl mb-5">🤍</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: G.dark, ...FRANK }}>תודה, {uploaderName}!</h1>
        <p className="text-base mb-1" style={{ color: G.olive, ...HEEBO }}>
          {doneCount} {doneCount === 1 ? "קובץ הועלה" : "קבצים הועלו"} בהצלחה
        </p>
        {errorCount > 0 && (
          <p className="text-sm mt-1" style={{ color: "#C05050", ...HEEBO }}>{errorCount} קבצים נכשלו</p>
        )}
        <p className="text-sm mt-4" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
          הזוג יקבל את התמונות שצילמת. תודה שהיית חלק מהיום המיוחד!
        </p>
        {errorCount > 0 && (
          <button
            onClick={() => { setAllDone(false); }}
            className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg,${G.olive},#4A5E3A)`, ...HEEBO }}
          >
            נסה שנית לקבצים שנכשלו
          </button>
        )}
      </div>
    );
  }

  // Name entry screen
  if (!nameSet) return (
    <div dir="rtl" className="min-h-screen flex flex-col" style={{ background: G.ivory }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="text-5xl mb-4">📸</div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: G.dark, ...FRANK }}>{album?.event_name}</h1>
        <p className="text-sm" style={{ color: G.gold, ...HEEBO }}>גלריית תמונות האירוע</p>
      </div>

      <div className="flex-1 px-5 max-w-sm mx-auto w-full">
        <div className="rounded-2xl p-6" style={{ background: "white", border: `1px solid ${G.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <p className="text-base font-semibold mb-1" style={{ color: G.dark, ...FRANK }}>מה שמך?</p>
          <p className="text-sm mb-5" style={{ color: "rgba(51,51,51,0.5)", ...HEEBO }}>
            כדי שהזוג ידע מי שלח כל תמונה
          </p>
          <input
            type="text"
            placeholder="שם פרטי ושם משפחה"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && uploaderName.trim().length >= 2) setNameSet(true); }}
            className="w-full rounded-xl px-4 py-3 text-base outline-none mb-4"
            style={{ background: G.cream, border: `1.5px solid ${G.border}`, color: G.dark, ...HEEBO }}
            autoFocus
          />
          <button
            onClick={() => { if (uploaderName.trim().length >= 2) setNameSet(true); }}
            disabled={uploaderName.trim().length < 2}
            className="w-full py-3.5 rounded-xl font-bold text-base text-white transition-opacity"
            style={{
              background: `linear-gradient(135deg,${G.gold},#B8935A)`,
              opacity: uploaderName.trim().length >= 2 ? 1 : 0.4,
              ...HEEBO,
            }}
          >
            המשך →
          </button>
        </div>
      </div>
    </div>
  );

  // Main upload screen
  const pendingCount   = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const doneCount      = files.filter((f) => f.status === "done").length;
  const isUploading    = uploadingCount > 0;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col pb-32" style={{ background: G.ivory }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: G.gold, ...HEEBO }}>גלריה</p>
        <h1 className="text-xl font-bold" style={{ color: G.dark, ...FRANK }}>{album?.event_name}</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
          שלום {uploaderName} — העלה תמונות וסרטונים מהאירוע
        </p>
      </div>

      {/* Drop zone */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-8 text-center border-2 border-dashed cursor-pointer"
          style={{ borderColor: G.border, background: "white" }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
        >
          <div className="flex justify-center gap-4 mb-3">
            <ImageIcon size={28} style={{ color: G.gold }} />
            <Video      size={28} style={{ color: G.olive }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: G.dark, ...HEEBO }}>גרור תמונות לכאן</p>
          <p className="text-xs" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>או לחץ לבחירה מהגלריה</p>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* Camera button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: G.cream, border: `1.5px solid ${G.border}`, color: G.dark, ...HEEBO }}
        >
          <Camera size={18} style={{ color: G.gold }} />
          צלם עכשיו
        </button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="px-4 space-y-3 mb-4">
          {files.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden flex items-center gap-3 px-4 py-3"
              style={{ background: "white", border: `1px solid ${G.border}` }}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: G.cream }}>
                {item.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                ) : item.isVideo ? (
                  <Video size={22} style={{ color: G.olive }} />
                ) : (
                  <ImageIcon size={22} style={{ color: G.gold }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: G.dark, ...HEEBO }}>
                  {item.isVideo ? "📹 סרטון" : "📷 תמונה"}
                </p>
                <p className="text-xs" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </p>

                {/* Progress bar */}
                {item.status === "uploading" && (
                  <div className="mt-1.5 rounded-full overflow-hidden h-1.5" style={{ background: G.cream }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%`, background: G.gold }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <p className="text-xs mt-0.5" style={{ color: "#C05050", ...HEEBO }}>{item.error}</p>
                )}
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {item.status === "pending"   && <button onClick={() => removeFile(item.id)}><X size={18} style={{ color: "rgba(51,51,51,0.3)" }} /></button>}
                {item.status === "uploading" && <Loader2 size={18} className="animate-spin" style={{ color: G.gold }} />}
                {item.status === "done"      && <CheckCircle2 size={20} style={{ color: "#3D8B5C" }} />}
                {item.status === "error"     && <AlertCircle size={18} style={{ color: "#C05050" }} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixed bottom bar */}
      {files.length > 0 && !isUploading && pendingCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 px-4 pb-6 pt-3" style={{ background: "rgba(253,250,245,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${G.border}` }}>
          <button
            onClick={uploadAll}
            className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${G.gold},#B8935A)`, ...HEEBO }}
          >
            <Upload size={18} />
            העלה {pendingCount} {pendingCount === 1 ? "קובץ" : "קבצים"}
            {doneCount > 0 && ` (${doneCount} כבר הועלו)`}
          </button>
        </div>
      )}

      {isUploading && (
        <div className="fixed bottom-0 inset-x-0 px-4 pb-6 pt-3" style={{ background: "rgba(253,250,245,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${G.border}` }}>
          <div className="w-full py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg,${G.olive},#4A5E3A)`, ...HEEBO }}>
            <Loader2 size={18} className="animate-spin" />
            מעלה... {doneCount}/{files.length}
          </div>
        </div>
      )}
    </div>
  );
}
