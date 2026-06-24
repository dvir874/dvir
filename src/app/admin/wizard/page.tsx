"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Check, ChevronRight, ChevronLeft, Upload, Trash2, Plus,
  AlertTriangle, Loader2, CheckCircle, ExternalLink,
} from "lucide-react";
import { THEME_LIST } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import {
  parseGuestText, parseCsvText, validateGuests,
  type ParsedGuest, type GuestValidation, ISSUE_LABEL,
} from "@/lib/guest-parser";

/* ── Design tokens ── */
const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};
const HEEBO = { fontFamily: "Heebo, sans-serif" };
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };

const EVENT_TYPES = [
  "חתונה", "בר מצווה", "בת מצווה", "חינה", "ברית", "יום הולדת", "אחר",
] as const;

type WizardStep = 1 | 2 | 3 | 4 | 5;
type GuestTab = "upload" | "paste" | "manual";

const STEP_LABELS = ["פרטי האירוע", "בחירת עיצוב", "מוזמנים", "סקירה", "סיום"];

export default function WizardPage() {
  const [step, setStep]       = useState<WizardStep>(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]   = useState<{ event_id: string; event_name: string; couple_token?: string | null; client_phone?: string | null; guest_count: number } | null>(null);
  const [submitError, setSubmitError] = useState("");

  /* Step 1 — Event details */
  const [eventType,      setEventType]      = useState("");
  const [eventName,      setEventName]      = useState("");
  const [eventDate,      setEventDate]      = useState("");
  const [venueName,      setVenueName]      = useState("");
  const [venueAddress,   setVenueAddress]   = useState("");
  const [clientPhone,    setClientPhone]    = useState("");

  /* Step 2 — Theme */
  const [theme, setTheme] = useState<ThemeId>("classic-light");

  /* Step 3 — Guests */
  const [guestTab,     setGuestTab]     = useState<GuestTab>("upload");
  const [pasteText,    setPasteText]    = useState("");
  const [manualRows,   setManualRows]   = useState<{ name: string; phone: string }[]>([{ name: "", phone: "" }]);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [validation,   setValidation]   = useState<GuestValidation | null>(null);
  const [fileLabel,    setFileLabel]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Guest helpers ── */
  function applyGuests(guests: ParsedGuest[]) {
    setParsedGuests(guests);
    setValidation(validateGuests(guests));
  }

  async function handleFileUpload(file: File) {
    setFileLabel(file.name);
    try {
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        applyGuests(parseCsvText(await file.text()));
      } else {
        const buffer = await file.arrayBuffer();
        const XLSX = await import("xlsx");
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const guests: ParsedGuest[] = rows.map((row) => ({
          name: String(row["שם"] ?? row["name"] ?? row["Name"] ?? "").trim(),
          phone: String(row["טלפון"] ?? row["phone"] ?? row["Phone"] ?? "").trim(),
          guest_count: Number(row["מספר מוזמנים"] ?? row["guests"] ?? 1) || 1,
        })).filter((g) => g.name.length > 0);
        applyGuests(guests);
      }
    } catch {
      setFileLabel("שגיאה בקריאת הקובץ");
    }
  }

  const onFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resolveGuestsForStep4(): ParsedGuest[] {
    if (guestTab === "paste") {
      const g = parseGuestText(pasteText);
      applyGuests(g);
      return g;
    }
    if (guestTab === "manual") {
      const g = manualRows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), phone: r.phone.trim(), guest_count: 1 }));
      applyGuests(g);
      return g;
    }
    return parsedGuests;
  }

  function goNext() {
    if (step === 3) resolveGuestsForStep4();
    setStep((s) => Math.min(s + 1, 5) as WizardStep);
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 1) as WizardStep);
  }

  async function handleCreate() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          name: eventName,
          date: eventDate,
          venue_name: venueName,
          address: venueAddress,
          theme,
          client_phone: clientPhone.trim() || undefined,
          guests: parsedGuests.filter((g) => g.name.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setResult(data);
      setStep(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  }

  const step1Valid = !!eventName && !!eventDate;

  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: C.cream }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center gap-4 px-5 py-3"
        style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}
      >
        <a
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
          style={{ background: "rgba(107,123,90,0.10)", color: C.olive, ...HEEBO }}
        >
          <ChevronLeft size={13} /> חזרה לניהול
        </a>
        <p className="text-sm font-bold" style={{ color: C.dark, ...FRANK }}>
          אשף יצירת אירוע
        </p>
      </div>

      {/* Progress bar */}
      {step < 5 && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-1.5 mb-2">
            {STEP_LABELS.slice(0, 4).map((label, i) => {
              const n    = i + 1;
              const done = step > n;
              const cur  = step === n;
              return (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: done ? C.olive : cur ? C.gold : "rgba(197,164,109,0.15)",
                        color: done || cur ? "white" : C.muted,
                      }}
                    >
                      {done ? <Check size={12} /> : n}
                    </div>
                    <span className="text-[10px] hidden sm:block whitespace-nowrap" style={{ color: cur ? C.dark : C.muted, ...HEEBO }}>
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className="flex-1 h-px"
                      style={{ background: done ? C.olive : C.border }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-20 pt-4">

        {/* ════════════════ STEP 1 — EVENT DETAILS ════════════════ */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>פרטי האירוע</CardTitle>

              {/* Event type */}
              <Label>סוג האירוע</Label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventType(t)}
                    className="py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: eventType === t ? "rgba(197,164,109,0.14)" : "white",
                      border: `1.5px solid ${eventType === t ? C.gold : C.border}`,
                      color: eventType === t ? C.dark : C.muted,
                      ...HEEBO,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <Field label="שם האירוע *" value={eventName} onChange={setEventName} placeholder="לדוגמה: חתונת כהן-לוי" />
              <Field label="תאריך האירוע *" type="date" value={eventDate} onChange={setEventDate} />
              <Field label="שם האולם / מקום" value={venueName} onChange={setVenueName} placeholder="לדוגמה: אולמי הגן" />
              <Field label="כתובת" value={venueAddress} onChange={setVenueAddress} placeholder="לדוגמה: הרצל 12, תל אביב" />
              <Field label="📱 טלפון הזוג (WhatsApp)" type="tel" value={clientPhone} onChange={setClientPhone} placeholder="לדוגמה: 0521234567" />
            </Card>

            <NavRow
              onNext={goNext}
              nextDisabled={!step1Valid}
              nextLabel="הבא — בחירת עיצוב"
            />
          </div>
        )}

        {/* ════════════════ STEP 2 — THEME ════════════════ */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>בחירת עיצוב</CardTitle>
              <p className="text-xs mb-4" style={{ color: C.muted, ...HEEBO }}>
                בחרו את הסגנון המתאים לאירוע — ניתן לשנות בהמשך
              </p>
              <div className="grid grid-cols-1 gap-2">
                {THEME_LIST.map((t) => {
                  const selected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-right transition-all"
                      style={{
                        background: selected ? "rgba(197,164,109,0.10)" : "white",
                        border: `1.5px solid ${selected ? C.gold : C.border}`,
                        boxShadow: selected ? "0 2px 12px rgba(197,164,109,0.15)" : "none",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex-shrink-0 relative overflow-hidden"
                        style={{ background: t.previewGradient }}
                      >
                        <div
                          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white/50"
                          style={{ background: t.previewAccent }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: C.dark, ...HEEBO }}>{t.nameHe}</p>
                      </div>
                      {selected && <Check size={16} style={{ color: C.gold }} />}
                    </button>
                  );
                })}
              </div>
            </Card>
            <NavRow onBack={goBack} onNext={goNext} nextLabel="הבא — מוזמנים" />
          </div>
        )}

        {/* ════════════════ STEP 3 — GUESTS ════════════════ */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>ייבוא רשימת מוזמנים</CardTitle>

              {/* Tabs */}
              <div className="flex rounded-2xl p-1 gap-1 mb-4" style={{ background: "rgba(197,164,109,0.10)" }}>
                {(["upload", "paste", "manual"] as GuestTab[]).map((tab) => {
                  const labels: Record<GuestTab, string> = { upload: "📂 קובץ", paste: "📋 הדבקה", manual: "✏️ ידנית" };
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setGuestTab(tab)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: guestTab === tab ? "white" : "transparent",
                        color: guestTab === tab ? C.dark : C.muted,
                        boxShadow: guestTab === tab ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                        ...HEEBO,
                      }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Upload */}
              {guestTab === "upload" && (
                <>
                  <div
                    className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: C.border, background: C.ivory }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onFileDrop}
                  >
                    <Upload size={24} className="mx-auto mb-2" style={{ color: C.gold }} />
                    <p className="text-sm font-medium" style={{ color: C.dark, ...HEEBO }}>
                      {fileLabel ?? "גרור קובץ או לחץ לבחירה"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.muted, ...HEEBO }}>
                      .xlsx · .csv · עמודות: שם, טלפון
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </>
              )}

              {/* Paste */}
              {guestTab === "paste" && (
                <div>
                  <textarea
                    rows={8}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"יוסי כהן, 0501234567\nרונית לוי, 0521234567"}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none font-mono"
                    style={{
                      background: C.ivory, border: `1px solid ${C.border}`,
                      color: C.dark, direction: "ltr",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => applyGuests(parseGuestText(pasteText))}
                    className="mt-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80"
                    style={{ background: C.olive, color: "white", ...HEEBO }}
                  >
                    עבד את הרשימה
                  </button>
                </div>
              )}

              {/* Manual */}
              {guestTab === "manual" && (
                <div>
                  {manualRows.map((row, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => setManualRows((p) => p.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))}
                        placeholder="שם"
                        className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: C.ivory, border: `1px solid ${C.border}`, ...HEEBO }}
                      />
                      <input
                        type="tel"
                        value={row.phone}
                        onChange={(e) => setManualRows((p) => p.map((r, idx) => idx === i ? { ...r, phone: e.target.value } : r))}
                        placeholder="טלפון"
                        className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: C.ivory, border: `1px solid ${C.border}`, direction: "ltr", ...HEEBO }}
                      />
                      <button
                        onClick={() => setManualRows((p) => p.filter((_, idx) => idx !== i))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl"
                        style={{ background: "rgba(200,60,60,0.08)", color: "rgb(180,60,60)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setManualRows((p) => [...p, { name: "", phone: "" }])}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
                    style={{ background: "rgba(107,123,90,0.10)", color: C.olive, ...HEEBO }}
                  >
                    <Plus size={14} /> הוסף שורה
                  </button>
                </div>
              )}

              {/* Validation preview */}
              {validation && validation.stats.total > 0 && (
                <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(107,123,90,0.06)", border: `1px solid rgba(107,123,90,0.14)` }}>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <StatMini label="סה״כ" value={validation.stats.total} />
                    <StatMini label="תקינים" value={validation.stats.valid} good />
                    {validation.stats.duplicatePhone > 0 && <StatMini label="כפולים" value={validation.stats.duplicatePhone} warn />}
                    {validation.stats.invalidPhone > 0 && <StatMini label="לא תקין" value={validation.stats.invalidPhone} warn />}
                    {validation.stats.missingPhone > 0 && <StatMini label="ללא טלפון" value={validation.stats.missingPhone} warn />}
                  </div>
                  {validation.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "rgb(160,60,60)", ...HEEBO }}>
                      <AlertTriangle size={10} />
                      שורה {issue.row + 1}: {validation.guests[issue.row]?.name || "ללא שם"} — {ISSUE_LABEL[issue.kind]}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <NavRow
              onBack={goBack}
              onNext={() => { resolveGuestsForStep4(); goNext(); }}
              nextLabel="הבא — סקירה"
            />
            <button
              type="button"
              onClick={goNext}
              className="text-center text-xs underline"
              style={{ color: C.muted, ...HEEBO }}
            >
              דלג — אוסיף מוזמנים מאוחר יותר
            </button>
          </div>
        )}

        {/* ════════════════ STEP 4 — REVIEW ════════════════ */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>סקירה לפני יצירה</CardTitle>

              <ReviewRow label="סוג אירוע"  value={eventType || "—"} />
              <ReviewRow label="שם האירוע"  value={eventName} bold />
              <ReviewRow label="תאריך"       value={new Date(eventDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })} />
              <ReviewRow label="מקום"        value={[venueName, venueAddress].filter(Boolean).join(" · ") || "—"} />

              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-xs mb-2" style={{ color: C.muted, ...HEEBO }}>עיצוב נבחר</p>
                {(() => {
                  const t = THEME_LIST.find((x) => x.id === theme);
                  return t ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg" style={{ background: t.previewGradient }} />
                      <span className="text-sm font-medium" style={{ color: C.dark, ...HEEBO }}>{t.nameHe}</span>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-xs mb-2" style={{ color: C.muted, ...HEEBO }}>מוזמנים</p>
                {parsedGuests.length > 0 && validation ? (
                  <div className="flex gap-4">
                    <span className="text-2xl font-bold" style={{ color: C.olive, ...FRANK }}>{validation.stats.total}</span>
                    <div className="text-xs" style={{ color: C.muted, ...HEEBO }}>
                      <p>{validation.stats.valid} תקינים</p>
                      {validation.issues.length > 0 && <p style={{ color: "rgb(180,100,0)" }}>{validation.issues.length} עם בעיות</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: C.muted, ...HEEBO }}>לא נוספו מוזמנים</p>
                )}
              </div>
            </Card>

            {submitError && (
              <div
                className="flex items-center gap-2 p-3 rounded-2xl text-sm"
                style={{ background: "rgba(200,60,60,0.08)", color: "rgb(180,60,60)", ...HEEBO }}
              >
                <AlertTriangle size={15} /> {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, ...HEEBO }}
              >
                <ChevronLeft size={15} className="inline ml-1" /> חזרה
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {submitting ? "יוצר אירוע..." : "צור אירוע"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ STEP 5 — SUCCESS ════════════════ */}
        {step === 5 && result && (() => {
          const phone = result.client_phone?.replace(/\D/g,"").replace(/^0/,"972") ?? "";
          const dashUrl = result.couple_token
            ? `${typeof window !== "undefined" ? window.location.origin : "https://regalifnei.vercel.app"}/couple/${result.couple_token}`
            : null;
          const eventDateStr = eventDate_display(eventDate);

          function waMsg(text: string) {
            return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
          }

          return (
            <div className="flex flex-col items-center text-center gap-5 pt-6 pb-12">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(107,123,90,0.12)" }}>
                <CheckCircle size={44} style={{ color: C.olive }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: C.dark, ...FRANK }}>האירוע נוצר בהצלחה!</h1>
                <p className="text-sm" style={{ color: C.muted, ...HEEBO }}>{result.event_name}</p>
              </div>

              {/* Summary card */}
              <div className="w-full rounded-2xl p-5 text-right" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                <ReviewRow label="אירוע"          value={result.event_name} bold />
                <ReviewRow label="מוזמנים שיובאו" value={result.guest_count > 0 ? `${result.guest_count} אורחים` : "לא יובאו"} />
                <ReviewRow label="טלפון זוג"       value={result.client_phone || "לא הוזן"} />
                <ReviewRow label="סטטוס"           value="מוכן לעריכה ✓" />
              </div>

              {/* WhatsApp actions — only when phone exists */}
              {phone && dashUrl && (
                <div className="w-full rounded-2xl p-4 text-right" style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)" }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "#1A9B4E", ...HEEBO }}>📱 שלח לזוג בוואטסאפ</p>
                  <div className="flex flex-col gap-2">

                    {/* 1. Welcome + dashboard link */}
                    <a href={waMsg(`🎉 שלום!\nהאירוע שלכם "${result.event_name}" מוכן במערכת רגע לפני!\n\nהנה הקישור לדשבורד האישי שלכם:\n${dashUrl}\n\nשם תמצאו את כל הפרטים, אישורי הגעה, הושבה ועוד 🤍`)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all hover:opacity-85"
                      style={{ background: "#25D366", color: "white", textDecoration: "none", ...HEEBO }}>
                      💌 שלח קישור דשבורד + ברכת פתיחה
                    </a>

                    {/* 2. RSVP reminder (for later) */}
                    <a href={waMsg(`שלום! 👋\nרק מזכיר — אתם יכולים לעקוב אחרי אישורי ההגעה בזמן אמת:\n${dashUrl}\n\nאורחים שעוד לא ענו — שווה לשלוח להם תזכורת 🙏`)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all hover:opacity-85"
                      style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E", textDecoration: "none", border: "1px solid rgba(37,211,102,0.25)", ...HEEBO }}>
                      📨 שלח תזכורת RSVP לזוג
                    </a>

                    {/* 4. Reminder 7 days before */}
                    <a href={waMsg(`הי! 🌟\nעוד שבוע לחתונה של ${result.event_name}!\nהמלצה: בדקו שכל האורחים אישרו, וסיימו את סידורי ההושבה.\n\nדשבורד: ${dashUrl}`)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all hover:opacity-85"
                      style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E", textDecoration: "none", border: "1px solid rgba(37,211,102,0.25)", ...HEEBO }}>
                      🔔 תזכורת "שבוע לפני" (לשלוח מאוחר יותר)
                    </a>

                    {/* 5. Day-of */}
                    <a href={waMsg(`🎊 היום זה הגדול!\n${result.event_name} — ${eventDateStr}\n\nמחכים לחגוג איתכם! 🤍\nכל הכבוד על ההכנות — הכל יהיה מושלם!`)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all hover:opacity-85"
                      style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E", textDecoration: "none", border: "1px solid rgba(37,211,102,0.25)", ...HEEBO }}>
                      🎉 ברכת יום האירוע (לשלוח ביום)
                    </a>
                  </div>
                </div>
              )}

              {/* No phone warning */}
              {!phone && (
                <div className="w-full rounded-2xl p-4 text-right" style={{ background: "rgba(197,164,109,0.08)", border: `1px solid ${C.border}` }}>
                  <p className="text-xs" style={{ color: C.muted, ...HEEBO }}>
                    💡 לא הוזן טלפון — לא ניתן לשלוח הודעות WhatsApp לזוג. ניתן לעדכן באדמין בהמשך.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col gap-3 w-full">
                <a href="/admin"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}>
                  <ExternalLink size={16} /> עבור ללוח הניהול
                </a>
                {result.event_id && (
                  <a href={`/event/${result.event_id}?preview=true`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
                    style={{ background: "rgba(107,123,90,0.10)", color: C.olive, ...HEEBO }}>
                    <ExternalLink size={15} /> תצוגה מקדימה
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function eventDate_display(dateStr: string) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }); } catch { return dateStr; }
}

/* ── Sub-components ── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-6" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mb-4" style={{ color: C.dark, ...FRANK }}>{children}</h2>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium mb-2" style={{ color: C.dark, ...HEEBO }}>{children}</p>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1.5" style={{ color: C.dark, ...HEEBO }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
        style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, ...HEEBO }}
      />
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "הבא", nextDisabled }: {
  onBack?: () => void; onNext?: () => void;
  nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1"
          style={{ background: "rgba(51,51,51,0.07)", color: C.muted, ...HEEBO }}
        >
          <ChevronLeft size={15} /> חזרה
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}
      >
        {nextLabel} <ChevronRight size={15} />
      </button>
    </div>
  );
}

function ReviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
      <span className="text-xs flex-shrink-0" style={{ color: C.muted, ...HEEBO }}>{label}</span>
      <span className={`text-sm text-left ${bold ? "font-bold" : "font-medium"}`} style={{ color: C.dark, ...HEEBO }}>{value}</span>
    </div>
  );
}

function StatMini({ label, value, good, warn }: { label: string; value: number; good?: boolean; warn?: boolean }) {
  return (
    <div
      className="flex flex-col items-center p-2 rounded-xl"
      style={{
        background: warn ? "rgba(200,80,60,0.07)" : good ? "rgba(107,123,90,0.09)" : "rgba(197,164,109,0.09)",
        ...HEEBO,
      }}
    >
      <span className="text-base font-bold" style={{ color: warn ? "rgb(180,60,60)" : good ? C.olive : C.dark }}>{value}</span>
      <span className="text-[10px]" style={{ color: C.muted }}>{label}</span>
    </div>
  );
}
