"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle, ChevronRight, Upload, Users, FileText,
  Plus, Trash2, AlertTriangle, Check, X, Loader2, Phone, Mail,
  Calendar, MapPin, User, MessageSquare, Sparkles,
} from "lucide-react";
import { THEME_LIST } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import {
  parseGuestText, parseCsvText, validateGuests,
  type ParsedGuest, type GuestValidation, ISSUE_LABEL,
} from "@/lib/guest-parser";
import { WA_URL } from "@/lib/constants";

/* ── Design tokens ────────────────────────────────── */
const C = {
  cream: "#F6F1E8",
  ivory: "#FDFAF5",
  gold:  "#C5A46D",
  olive: "#6B7B5A",
  dark:  "#333333",
  muted: "rgba(51,51,51,0.55)",
  border:"rgba(197,164,109,0.22)",
};
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO = { fontFamily: "Heebo, sans-serif" };

/* ── Event types ──────────────────────────────────── */
const EVENT_TYPES = [
  { value: "חתונה",      emoji: "💍" },
  { value: "בר מצווה",  emoji: "✡️" },
  { value: "בת מצווה",  emoji: "✨" },
  { value: "חינה",       emoji: "🌿" },
  { value: "ברית",       emoji: "🕊️" },
  { value: "יום הולדת", emoji: "🎂" },
  { value: "אחר",        emoji: "🎉" },
] as const;

/* ── Steps ────────────────────────────────────────── */
type Step = "event" | "guests" | "review" | "success";
type GuestTab = "upload" | "paste" | "manual";

/* ── Component ────────────────────────────────────── */
export default function StartPage() {
  const [step, setStep] = useState<Step>("event");

  /* Event details */
  const [eventType,    setEventType]    = useState("");
  const [eventName,    setEventName]    = useState("");
  const [eventDate,    setEventDate]    = useState("");
  const [venueName,    setVenueName]    = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [clientName,   setClientName]   = useState("");
  const [clientPhone,  setClientPhone]  = useState("");
  const [clientEmail,  setClientEmail]  = useState("");
  const [notes,        setNotes]        = useState("");
  const [theme,        setTheme]        = useState<ThemeId>("classic-light");

  /* Guest import */
  const [guestTab,      setGuestTab]      = useState<GuestTab>("upload");
  const [pasteText,     setPasteText]     = useState("");
  const [manualRows,    setManualRows]    = useState<{ name: string; phone: string }[]>([{ name: "", phone: "" }]);
  const [parsedGuests,  setParsedGuests]  = useState<ParsedGuest[]>([]);
  const [validation,    setValidation]    = useState<GuestValidation | null>(null);
  const [fileLabel,     setFileLabel]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Submission */
  const [submitting, setSubmitting]  = useState(false);
  const [result,     setResult]      = useState<{ event_id: string; event_name: string; guest_count: number } | null>(null);
  const [submitError, setSubmitError] = useState("");

  /* ── Helpers ─────────────────────────────────────── */
  function applyGuests(guests: ParsedGuest[]) {
    setParsedGuests(guests);
    setValidation(validateGuests(guests));
  }

  async function handleFileUpload(file: File) {
    setFileLabel(file.name);
    try {
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text();
        applyGuests(parseCsvText(text));
      } else {
        // XLSX
        const buffer = await file.arrayBuffer();
        const XLSX = await import("xlsx");
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const guests: ParsedGuest[] = rows.map((row) => ({
          name: String(row["שם"] ?? row["name"] ?? row["Name"] ?? row["שם מלא"] ?? "").trim(),
          phone: String(row["טלפון"] ?? row["phone"] ?? row["Phone"] ?? row["מספר טלפון"] ?? "").trim(),
          guest_count: Number(row["מספר מוזמנים"] ?? row["guests"] ?? row["guest_count"] ?? 1) || 1,
        })).filter((g) => g.name.length > 0);
        applyGuests(guests);
      }
    } catch {
      setFileLabel("שגיאה בקריאת הקובץ");
    }
  }

  const onFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function handlePasteParse() {
    applyGuests(parseGuestText(pasteText));
  }

  function buildManualGuests(): ParsedGuest[] {
    return manualRows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), phone: r.phone.trim(), guest_count: 1 }));
  }

  function addManualRow() {
    setManualRows((p) => [...p, { name: "", phone: "" }]);
  }

  function removeManualRow(i: number) {
    setManualRows((p) => p.filter((_, idx) => idx !== i));
  }

  function updateManualRow(i: number, field: "name" | "phone", val: string) {
    setManualRows((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function goToReview() {
    let guests = parsedGuests;
    if (guestTab === "manual") {
      guests = buildManualGuests();
      setParsedGuests(guests);
      setValidation(validateGuests(guests));
    } else if (guestTab === "paste" && parsedGuests.length === 0 && pasteText.trim()) {
      guests = parseGuestText(pasteText);
      applyGuests(guests);
    }
    setStep("review");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const guests = parsedGuests.length > 0
        ? parsedGuests.filter((g) => g.name.trim())
        : [];

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          name: eventName,
          date: eventDate,
          venue_name: venueName,
          address: venueAddress,
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail,
          notes,
          theme,
          guests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה לא צפויה");
      setResult(data);
      setStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = { event: 0, guests: 1, review: 2, success: 3 };

  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: C.cream }}>
      {/* ── Logo / Brand bar ── */}
      <div
        className="sticky top-0 z-20 py-3 px-5 flex items-center gap-3"
        style={{ background: C.ivory, borderBottom: `1px solid ${C.border}` }}
      >
        <a href="/" className="text-sm font-bold" style={{ color: C.gold, ...FRANK }}>
          ✦ רגע לפני
        </a>
        <span className="text-xs" style={{ color: C.muted, ...HEEBO }}>
          · טופס פתיחת אירוע
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">

        {/* ── Step indicator ── */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-2 py-8">
            {(["event", "guests", "review"] as const).map((s, i) => {
              const done    = stepIndex[step] > i;
              const current = step === s;
              return (
                <React.Fragment key={s}>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: done ? C.olive : current ? C.gold : "rgba(197,164,109,0.15)",
                      color: done || current ? "white" : C.muted,
                    }}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className="text-xs hidden sm:block"
                    style={{ color: current ? C.dark : C.muted, ...HEEBO }}
                  >
                    {s === "event" ? "פרטי האירוע" : s === "guests" ? "רשימת מוזמנים" : "אישור ושליחה"}
                  </span>
                  {i < 2 && (
                    <div
                      className="flex-1 max-w-[40px] h-px"
                      style={{ background: done ? C.olive : C.border }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* STEP 1 — EVENT DETAILS                     */}
        {/* ══════════════════════════════════════════ */}
        {step === "event" && (
          <div className="flex flex-col gap-5">
            <SectionCard>
              <SectionTitle>✦ פרטי האירוע</SectionTitle>

              {/* Event type */}
              <label className="block text-sm font-semibold mb-2" style={{ color: C.dark, ...HEEBO }}>
                סוג האירוע
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setEventType(t.value)}
                    className="flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-medium transition-all duration-200"
                    style={{
                      background: eventType === t.value ? "rgba(197,164,109,0.14)" : "white",
                      border: `1.5px solid ${eventType === t.value ? C.gold : C.border}`,
                      color: eventType === t.value ? C.dark : C.muted,
                      boxShadow: eventType === t.value ? "0 2px 12px rgba(197,164,109,0.18)" : "none",
                      ...HEEBO,
                    }}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    {t.value}
                  </button>
                ))}
              </div>

              {/* Event name */}
              <Field
                label="שם האירוע" icon={<Sparkles size={15} style={{ color: C.gold }} />}
                required value={eventName} onChange={setEventName}
                placeholder="לדוגמה: חתונת כהן-לוי"
              />

              {/* Date */}
              <Field
                label="תאריך האירוע" icon={<Calendar size={15} style={{ color: C.gold }} />}
                required type="date" value={eventDate} onChange={setEventDate}
              />

              {/* Venue */}
              <Field
                label="שם האולם / מקום" icon={<MapPin size={15} style={{ color: C.gold }} />}
                value={venueName} onChange={setVenueName}
                placeholder="לדוגמה: אולמי הגן"
              />
              <Field
                label="כתובת המקום"
                value={venueAddress} onChange={setVenueAddress}
                placeholder="לדוגמה: הרצל 12, תל אביב"
              />
            </SectionCard>

            {/* Client info */}
            <SectionCard>
              <SectionTitle>👤 פרטי ליצירת קשר</SectionTitle>
              <Field
                label="שמכם" icon={<User size={15} style={{ color: C.gold }} />}
                required value={clientName} onChange={setClientName}
                placeholder="שם מלא"
              />
              <Field
                label="מספר טלפון" icon={<Phone size={15} style={{ color: C.gold }} />}
                required type="tel" value={clientPhone} onChange={setClientPhone}
                placeholder="05X-XXXXXXX"
              />
              <Field
                label="אימייל (לא חובה)" icon={<Mail size={15} style={{ color: C.gold }} />}
                type="email" value={clientEmail} onChange={setClientEmail}
                placeholder="example@gmail.com"
              />
              <div className="mb-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.dark, ...HEEBO }}>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={15} style={{ color: C.gold }} />
                    הערות נוספות (לא חובה)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="כל מידע שתרצו להוסיף — סגנון רצוי, מספר משוער של מוזמנים, העדפות וכו׳"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    background: C.ivory, border: `1px solid ${C.border}`,
                    color: C.dark, ...HEEBO,
                  }}
                />
              </div>
            </SectionCard>

            {/* Theme / Design */}
            <SectionCard>
              <SectionTitle>🎨 סגנון עיצוב</SectionTitle>
              <p className="text-xs mb-3" style={{ color: C.muted, ...HEEBO }}>
                בחרו את הסגנון שמתאים לאופי האירוע שלכם — ניתן לשנות בהמשך
              </p>
              <div className="grid grid-cols-1 gap-2">
                {THEME_LIST.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-right w-full transition-all duration-200"
                    style={{
                      background: theme === t.id ? "rgba(197,164,109,0.10)" : "white",
                      border: `1.5px solid ${theme === t.id ? C.gold : C.border}`,
                      boxShadow: theme === t.id ? "0 2px 12px rgba(197,164,109,0.15)" : "none",
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
                    <p className="flex-1 font-semibold text-sm" style={{ color: C.dark, ...HEEBO }}>
                      {t.nameHe}
                    </p>
                    {theme === t.id && <Check size={16} style={{ color: C.gold }} />}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Next */}
            <PrimaryButton
              disabled={!eventName || !eventDate || !clientName || !clientPhone}
              onClick={() => setStep("guests")}
            >
              המשך לרשימת מוזמנים
              <ChevronRight size={17} />
            </PrimaryButton>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* STEP 2 — GUEST IMPORT                      */}
        {/* ══════════════════════════════════════════ */}
        {step === "guests" && (
          <div className="flex flex-col gap-5">
            <SectionCard>
              <SectionTitle>👥 רשימת מוזמנים</SectionTitle>
              <p className="text-xs mb-4" style={{ color: C.muted, ...HEEBO }}>
                ניתן גם לדלג ולהוסיף מוזמנים מאוחר יותר
              </p>

              {/* Tab bar */}
              <div
                className="flex rounded-2xl p-1 mb-5 gap-1"
                style={{ background: "rgba(197,164,109,0.10)" }}
              >
                {(["upload", "paste", "manual"] as GuestTab[]).map((tab) => {
                  const labels: Record<GuestTab, string> = {
                    upload: "📂 העלאת קובץ",
                    paste:  "📋 הדבקת רשימה",
                    manual: "✏️ הזנה ידנית",
                  };
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setGuestTab(tab)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
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

              {/* Upload tab */}
              {guestTab === "upload" && (
                <div>
                  <div
                    className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-gold transition-colors"
                    style={{ borderColor: C.border, background: C.ivory }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onFileDrop}
                  >
                    <Upload size={28} className="mx-auto mb-3" style={{ color: C.gold }} />
                    <p className="font-semibold text-sm mb-1" style={{ color: C.dark, ...HEEBO }}>
                      {fileLabel ? fileLabel : "גררו קובץ לכאן או לחצו לבחירה"}
                    </p>
                    <p className="text-xs" style={{ color: C.muted, ...HEEBO }}>
                      תומך ב-.xlsx ו-.csv
                    </p>
                    <p className="text-xs mt-2" style={{ color: C.muted, ...HEEBO }}>
                      מבנה הקובץ: עמודה &quot;שם&quot; + עמודה &quot;טלפון&quot;
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              )}

              {/* Paste tab */}
              {guestTab === "paste" && (
                <div>
                  <p className="text-xs mb-2" style={{ color: C.muted, ...HEEBO }}>
                    הדביקו את הרשימה בפורמט: שם, טלפון (שורה לכל אורח)
                  </p>
                  <textarea
                    rows={10}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"יוסי כהן, 0501234567\nרונית לוי, 0521234567\nמשה אברהם, 0541234567"}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none font-mono"
                    style={{
                      background: C.ivory, border: `1px solid ${C.border}`,
                      color: C.dark, direction: "ltr",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePasteParse}
                    className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: C.olive, color: "white", ...HEEBO }}
                  >
                    עבד את הרשימה
                  </button>
                </div>
              )}

              {/* Manual tab */}
              {guestTab === "manual" && (
                <div>
                  <div className="flex flex-col gap-2 mb-3">
                    {manualRows.map((row, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateManualRow(i, "name", e.target.value)}
                          placeholder="שם"
                          className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, ...HEEBO }}
                        />
                        <input
                          type="tel"
                          value={row.phone}
                          onChange={(e) => updateManualRow(i, "phone", e.target.value)}
                          placeholder="טלפון"
                          className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{
                            background: C.ivory, border: `1px solid ${C.border}`,
                            color: C.dark, ...HEEBO, direction: "ltr",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeManualRow(i)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                          style={{ background: "rgba(200,60,60,0.08)", color: "rgb(180,60,60)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addManualRow}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-80"
                    style={{ background: "rgba(107,123,90,0.10)", color: C.olive, ...HEEBO }}
                  >
                    <Plus size={15} /> הוסף שורה
                  </button>
                </div>
              )}

              {/* Validation preview */}
              {validation && validation.stats.total > 0 && (
                <div
                  className="mt-5 rounded-2xl p-4"
                  style={{ background: "rgba(107,123,90,0.06)", border: `1px solid rgba(107,123,90,0.15)` }}
                >
                  <p className="text-sm font-semibold mb-2.5" style={{ color: C.dark, ...HEEBO }}>
                    <CheckCircle size={14} className="inline ml-1.5" style={{ color: C.olive }} />
                    סיכום רשימת מוזמנים
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ ...HEEBO }}>
                    <StatPill label="סה״כ מוזמנים" value={validation.stats.total} color={C.olive} />
                    <StatPill label="תקינים" value={validation.stats.valid} color={C.olive} />
                    {validation.stats.duplicatePhone > 0 && (
                      <StatPill label="טלפון כפול" value={validation.stats.duplicatePhone} color="rgb(180,120,0)" warn />
                    )}
                    {validation.stats.invalidPhone > 0 && (
                      <StatPill label="טלפון לא תקין" value={validation.stats.invalidPhone} color="rgb(180,60,60)" warn />
                    )}
                    {validation.stats.missingPhone > 0 && (
                      <StatPill label="ללא טלפון" value={validation.stats.missingPhone} color="rgb(180,120,0)" warn />
                    )}
                    {validation.stats.missingName > 0 && (
                      <StatPill label="ללא שם" value={validation.stats.missingName} color="rgb(180,60,60)" warn />
                    )}
                  </div>

                  {/* Issue list — first 5 */}
                  {validation.issues.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {validation.issues.slice(0, 5).map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(200,80,80,0.07)", color: "rgb(160,60,60)", ...HEEBO }}
                        >
                          <AlertTriangle size={11} />
                          שורה {issue.row + 1}: {validation.guests[issue.row]?.name || "(ללא שם)"} — {ISSUE_LABEL[issue.kind]}
                        </div>
                      ))}
                      {validation.issues.length > 5 && (
                        <p className="text-[11px] mt-1" style={{ color: C.muted, ...HEEBO }}>
                          +{validation.issues.length - 5} בעיות נוספות
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("event")}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, ...HEEBO }}
              >
                חזרה
              </button>
              <button
                type="button"
                onClick={goToReview}
                className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}
              >
                המשך לסיכום
                <ChevronRight size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={goToReview}
              className="text-center text-xs underline"
              style={{ color: C.muted, ...HEEBO }}
            >
              דלג — אוסיף מוזמנים מאוחר יותר
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* STEP 3 — REVIEW                            */}
        {/* ══════════════════════════════════════════ */}
        {step === "review" && (
          <div className="flex flex-col gap-5">
            {/* Event summary card */}
            <SectionCard>
              <SectionTitle>✦ סיכום האירוע</SectionTitle>
              <ReviewRow label="סוג אירוע"     value={eventType || "—"} />
              <ReviewRow label="שם האירוע"     value={eventName} bold />
              <ReviewRow label="תאריך"         value={eventDate ? new Date(eventDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <ReviewRow label="מקום"          value={[venueName, venueAddress].filter(Boolean).join(" · ") || "—"} />
              <ReviewRow label="שם הלקוח"      value={clientName} />
              <ReviewRow label="טלפון"          value={clientPhone} />
              {clientEmail && <ReviewRow label="אימייל" value={clientEmail} />}
              {notes && <ReviewRow label="הערות" value={notes} />}
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-xs mb-1" style={{ color: C.muted, ...HEEBO }}>סגנון עיצוב</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const t = THEME_LIST.find((x) => x.id === theme);
                    return t ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ background: t.previewGradient }}
                        />
                        <span className="text-sm font-medium" style={{ color: C.dark, ...HEEBO }}>{t.nameHe}</span>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            </SectionCard>

            {/* Guest summary */}
            <SectionCard>
              <SectionTitle>👥 מוזמנים</SectionTitle>
              {parsedGuests.length > 0 && validation ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatBlock label="סה״כ מוזמנים" value={validation.stats.total} />
                    <StatBlock label="ללא בעיות"    value={validation.stats.valid} />
                  </div>
                  {validation.issues.length > 0 && (
                    <div
                      className="flex items-start gap-2.5 p-3 rounded-xl text-xs mb-3"
                      style={{ background: "rgba(200,120,0,0.07)", color: "rgb(160,90,0)", ...HEEBO }}
                    >
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                      <span>
                        נמצאו {validation.issues.length} בעיות ברשימה. ניתן לתקן עכשיו או לייבא ולתקן מאוחר יותר בלוח הניהול.
                      </span>
                    </div>
                  )}
                  {/* First 5 guests preview */}
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    {parsedGuests.slice(0, 5).map((g, i) => {
                      const hasIssue = validation.issues.some((iss) => iss.row === i);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs"
                          style={{
                            background: hasIssue ? "rgba(200,80,80,0.04)" : i % 2 === 0 ? "white" : C.ivory,
                            borderBottom: i < 4 && i < parsedGuests.length - 1 ? `1px solid ${C.border}` : "none",
                            ...HEEBO,
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{ background: hasIssue ? "rgba(200,60,60,0.10)" : "rgba(107,123,90,0.12)", color: hasIssue ? "rgb(180,60,60)" : C.olive }}
                          >
                            {i + 1}
                          </div>
                          <span className="flex-1 font-medium" style={{ color: C.dark }}>{g.name}</span>
                          <span style={{ color: C.muted, direction: "ltr" }}>{g.phone || "ללא טלפון"}</span>
                          {hasIssue && <X size={11} style={{ color: "rgb(180,60,60)" }} />}
                        </div>
                      );
                    })}
                    {parsedGuests.length > 5 && (
                      <div className="px-3 py-2 text-xs text-center" style={{ color: C.muted, background: C.ivory, ...HEEBO }}>
                        + עוד {parsedGuests.length - 5} מוזמנים
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: C.muted, ...HEEBO }}>
                  לא הוספו מוזמנים — ניתן לייבא לאחר יצירת האירוע
                </p>
              )}
            </SectionCard>

            {submitError && (
              <div
                className="flex items-center gap-2.5 p-3.5 rounded-2xl text-sm"
                style={{ background: "rgba(200,60,60,0.08)", color: "rgb(180,60,60)", ...HEEBO }}
              >
                <AlertTriangle size={16} className="flex-shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("guests")}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, ...HEEBO }}
              >
                חזרה
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> שולח…</>
                ) : (
                  <>אשר והמשך <ChevronRight size={17} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SUCCESS                                    */}
        {/* ══════════════════════════════════════════ */}
        {step === "success" && result && (
          <div className="flex flex-col items-center text-center gap-6 pt-8 pb-12">
            {/* Check icon */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "rgba(107,123,90,0.12)" }}
            >
              <CheckCircle size={52} style={{ color: C.olive }} />
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: C.dark, ...FRANK }}>
                האירוע נוצר בהצלחה!
              </h1>
              <p className="text-sm" style={{ color: C.muted, ...HEEBO }}>
                תודה שבחרתם רגע לפני — נחזור אליכם בקרוב
              </p>
            </div>

            {/* Summary block */}
            <div
              className="w-full rounded-3xl p-6 text-right"
              style={{ background: C.ivory, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: C.gold, ...HEEBO }}>
                ✦ פרטי האירוע שנשלחו
              </p>
              <ReviewRow label="שם האירוע" value={result.event_name} bold />
              {result.guest_count > 0 && (
                <ReviewRow label="מוזמנים שיובאו" value={`${result.guest_count} אורחים`} />
              )}
              <ReviewRow label="סטטוס" value={result.guest_count > 0 ? "רשימה יובאה ✓" : "פרטים התקבלו ✓"} />
            </div>

            {/* Next steps */}
            <div
              className="w-full rounded-3xl p-5 text-right"
              style={{ background: "rgba(107,123,90,0.07)", border: `1px solid rgba(107,123,90,0.15)` }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: C.olive, ...HEEBO }}>מה קורה עכשיו?</p>
              <div className="flex flex-col gap-2.5">
                {[
                  "נבדוק את פרטי האירוע שהגיעו",
                  "נצור אתכם קשר לאישור ופרטים נוספים",
                  "נכין את ההזמנות בהתאם לסגנון שבחרתם",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm" style={{ ...HEEBO }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: C.olive }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ color: C.dark }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", ...HEEBO }}
            >
              <MessageSquare size={18} />
              שלחו לנו הודעה בוואטסאפ
            </a>

            <a
              href="/"
              className="text-sm underline"
              style={{ color: C.muted, ...HEEBO }}
            >
              חזרה לדף הבית
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────── */

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6"
      style={{ background: C.ivory, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-bold mb-5"
      style={{ color: C.dark, ...FRANK }}
    >
      {children}
    </h2>
  );
}

function Field({
  label, icon, required, value, onChange, placeholder, type = "text",
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: C.dark, ...HEEBO }}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
          {required && <span style={{ color: C.gold }}>*</span>}
        </span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{
          background: C.ivory,
          border: `1px solid ${C.border}`,
          color: C.dark,
          ...HEEBO,
        }}
      />
    </div>
  );
}

function PrimaryButton({
  children, onClick, disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40"
      style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, ...HEEBO }}
    >
      {children}
    </button>
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

function StatPill({ label, value, color, warn }: { label: string; value: number; color: string; warn?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
      style={{
        background: warn ? "rgba(200,80,60,0.06)" : "rgba(107,123,90,0.08)",
        border: `1px solid ${warn ? "rgba(200,80,60,0.15)" : "rgba(107,123,90,0.15)"}`,
        ...HEEBO,
      }}
    >
      <span className="font-bold text-sm" style={{ color }}>{value}</span>
      <span style={{ color: C.muted }}>{label}</span>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: "rgba(107,123,90,0.08)", border: `1px solid rgba(107,123,90,0.12)` }}
    >
      <p className="text-2xl font-bold mb-1" style={{ color: C.olive, ...FRANK }}>{value}</p>
      <p className="text-xs" style={{ color: C.muted, ...HEEBO }}>{label}</p>
    </div>
  );
}
