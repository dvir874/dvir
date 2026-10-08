"use client";

/* Content Hub — one item. Stitch screen 4cacf93a, approved 08/10/2026.
 *
 * Departures from the render:
 * - Stitch drew a product top-nav ("דשבורד ראשי · זוגות ואירועים · …") that
 *   does not exist anywhere in the admin; the breadcrumb back to the hub is
 *   the navigation.
 * - It invented figures (CTR 4.8%, "שיעור המרה 18.2%"). Those are not fields
 *   we record, so they are gone; every number on this page is one Dvir typed.
 * - "עריכה חיה": every field saves on blur, so "עריכה" just scrolls to and
 *   focuses the title rather than opening a mode.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, Upload, Star, X, ChevronDown } from "lucide-react";
import {
  FORMATS, FORMAT_LABEL, GOALS, GOAL_LABEL, METRICS, PLATFORMS, STATUSES, STATUS_LABEL,
  buildBriefPrompt, parseBrief, trackingLink,
  type ContentItem, type Shot,
} from "@/lib/content-brief";
import { Chip, StatusBadge, T, fmtDate, serif } from "../_ui";

type Patch = Partial<ContentItem>;

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/content/${id}`).then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setItem(d.item)))
      .catch(() => setError("טעינה נכשלה"));
  }, [id]);

  const save = useCallback(async (patch: Patch) => {
    setItem((cur) => (cur ? { ...cur, ...patch } : cur));
    const r = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    }).then((x) => x.json()).catch(() => ({ error: "שמירה נכשלה" }));
    if (r.error) { setError(r.error); return; }
    setItem(r.item);
    setSaved("נשמר");
    setTimeout(() => setSaved(""), 1500);
  }, [id]);

  const duplicate = async () => {
    const r = await fetch(`/api/admin/content/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "duplicate" }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.item) router.push(`/admin/content/${r.item.id}`);
  };

  if (error && !item) return <Shell><p style={{ color: T.warn }}>{error}</p></Shell>;
  if (!item) return <Shell><p style={{ color: T.muted }}>טוען…</p></Shell>;

  return (
    <Shell>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between font-body text-[13px]" style={{ color: T.faint }}>
        <div className="flex items-center gap-2">
          <Link href="/admin/content" className="font-semibold" style={{ color: T.goldT }}>← חזרה ל-Content Hub</Link>
          <span>/ פריט c-{item.id.slice(0, 8)}</span>
        </div>
        <span>{saved || `נוצר: ${fmtDate(item.created_at)} · עודכן: ${fmtDate(item.updated_at)}`}</span>
      </div>

      {/* Header card */}
      <section className="mt-4 flex flex-wrap items-center justify-between gap-6 rounded-2xl p-7 shadow-sm"
        style={{ background: T.card, border: `1px solid ${T.border}` }}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge s={item.status} />
            <Select value={item.format} onChange={(v) => save({ format: v as ContentItem["format"] })}
              options={FORMATS.map((f) => [f, `פורמט: ${f} · ${FORMAT_LABEL[f]}`])} />
            <Select value={item.content_goal ?? ""} onChange={(v) => save({ content_goal: (v || null) as ContentItem["content_goal"] })}
              options={[["", "מטרה: —"], ...GOALS.map((g) => [g, `מטרה: ${GOAL_LABEL[g]}`] as [string, string])]} tone="gold" />
            {PLATFORMS.map((p) => {
              const on = item.platforms.includes(p);
              return (
                <button key={p} onClick={() => save({ platforms: on ? item.platforms.filter((x) => x !== p) : [...item.platforms, p] })}
                  className="rounded-md px-2 py-0.5 font-body text-[12px]"
                  style={{ border: `1px solid ${on ? T.dark : T.border}`, background: on ? "#fff" : "transparent", color: on ? T.dark : T.faint }}>
                  {p === "instagram" ? "Instagram" : p === "tiktok" ? "TikTok" : "Facebook"}
                </button>
              );
            })}
          </div>
          <input ref={titleRef} defaultValue={item.title} key={item.title}
            onBlur={(e) => e.target.value !== item.title && save({ title: e.target.value })}
            className="mt-3 w-full bg-transparent text-[30px] font-bold outline-none" style={{ fontFamily: serif, color: T.dark }} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Btn onClick={() => titleRef.current?.focus()}>עריכה</Btn>
          <label className="relative inline-flex h-10 items-center gap-2 rounded-lg px-4 font-body text-[14px]"
            style={{ border: `1px solid ${T.border}`, background: "#fff" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.gold }} />
            שינוי סטטוס: <b>{item.status}</b> <ChevronDown className="h-3.5 w-3.5" />
            <select value={item.status} onChange={(e) => save({ status: e.target.value as ContentItem["status"] })}
              className="absolute inset-0 cursor-pointer opacity-0">
              {STATUSES.map((s) => <option key={s} value={s}>{s} · {STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <Btn onClick={duplicate}><Copy className="h-3.5 w-3.5" /> שכפול</Btn>
          <button onClick={() => save({ status: "WINNER" })}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-5 font-body text-[14px] font-semibold"
            style={{ background: T.gold, color: T.dark }}>
            <Star className="h-4 w-4 fill-current" /> סמן כ-Winner
          </button>
          <button onClick={() => confirm("לסמן את הסרטון כ-KILLED?") && save({ status: "KILLED" })}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 font-body text-[14px]"
            style={{ border: `1px solid ${T.warn}`, color: T.warn, background: "#fff" }}>
            <X className="h-4 w-4" /> Kill
          </button>
        </div>
      </section>

      {error && <p className="mt-3 font-body text-[13px]" style={{ color: T.warn }}>{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main column */}
        <div className="space-y-6">
          <Section en="PAIN POINT" he="נקודת הכאב" aside="עריכה חיה">
            <Area value={item.pain_point} onSave={(v) => save({ pain_point: v })} rows={2} />
          </Section>

          <Section en={`HOOK · ${item.hook_options.length ? item.hook_options.length + " " : ""}שניות ראשונות`} he=""
            aside={item.hook_options.length ? `${item.hook_options.length} אפשרויות נבחנו` : ""}>
            {item.hook_options.length > 0 ? (
              <div className="space-y-2.5">
                {item.hook_options.map((h, n) => {
                  const chosen = h === item.hook;
                  return (
                    <button key={n} onClick={() => save({ hook: h })}
                      className="flex w-full items-center gap-3 rounded-xl p-4 text-right font-body text-[15px]"
                      style={{ border: chosen ? `2px solid ${T.gold}` : `1px solid ${T.border}`, background: chosen ? "#FBF6EC" : "#fff" }}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                        style={{ background: chosen ? T.gold : "#EFEBE4" }}>{n + 1}</span>
                      <span className="flex-1" style={{ color: chosen ? T.dark : T.muted }}>&quot;{h}&quot;</span>
                      {chosen && <span className="rounded-md px-2 py-0.5 text-[12px] font-bold" style={{ background: T.gold }}>נבחר ✓</span>}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className={item.hook_options.length ? "mt-3" : ""}>
              <Area value={item.hook} onSave={(v) => save({ hook: v })} rows={2} placeholder="הקרס שנבחר" />
            </div>
          </Section>

          <Section en="SCRIPT" he="תסריט מלא (15–30 שניות)" aside={item.script ? `${item.script.split(/\s+/).filter(Boolean).length} מילים` : ""}>
            <Area value={item.script} onSave={(v) => save({ script: v })} rows={7} />
          </Section>

          <Section en="STORYBOARD" he="טבלת שוטים מפורטת" aside={item.storyboard.length ? `${item.storyboard.length} שוטים להפקה` : ""}>
            <Storyboard shots={item.storyboard} onSave={(s) => save({ storyboard: s })} />
          </Section>

          <Section en="VISUAL PROMPTS" he="פרומפטים להפקה (one per shot)" aside="Monospace Copyable">
            {item.visual_prompts.length === 0 && <Empty>ייכנסו לכאן אחרי Generate Brief.</Empty>}
            <div className="space-y-3">
              {item.visual_prompts.map((p, n) => (
                <div key={n} className="rounded-xl p-4" style={{ border: `1px solid ${T.border}`, background: "#FAF7F1" }}>
                  <div className="flex items-start gap-3">
                    <CopyBtn text={p} />
                    <div className="flex-1" dir="ltr">
                      <div className="font-mono text-[11px] font-bold" style={{ color: T.goldT }}>SHOT {String(n + 1).padStart(2, "0")} PROMPT</div>
                      <p className="mt-1 font-mono text-[13px] leading-relaxed" style={{ color: T.dark }}>{p}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Section en="VOICEOVER" he="קריינות">
              <Area value={item.voiceover} onSave={(v) => save({ voiceover: v })} rows={6} />
            </Section>
            <Section en="ON-SCREEN TEXT" he="כתוביות מסך">
              <Area value={item.on_screen_text} onSave={(v) => save({ on_screen_text: v })} rows={6} />
            </Section>
            <Section en="CAPTION" he="טקסט לפוסט">
              <Area value={item.caption} onSave={(v) => save({ caption: v })} rows={6} />
            </Section>
            <Section en="CTA" he="הנעה לפעולה">
              <Area value={item.cta} onSave={(v) => save({ cta: v })} rows={2} placeholder="דברו איתנו בוואטסאפ" />
            </Section>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <BriefCard item={item} onFill={save} />

          <Side title="תוצאות וביצועים" tag="מדורג לפי חשיבות">
            <div className="space-y-2">
              {METRICS.map((m, n) => (
                <div key={m.key} className="flex items-center gap-3 rounded-lg px-3 py-1.5"
                  style={n < 2 ? { background: "#FBF4E6", border: "1px solid #EBDDBF" } : undefined}>
                  <span className="w-4 font-mono text-[11px]" style={{ color: T.faint }}>{n + 1}</span>
                  <span className="flex-1 font-body text-[14px]" style={{ color: n < 2 ? T.goldT : T.dark, fontWeight: n < 2 ? 700 : 400 }}>{m.label}</span>
                  <NumInput value={item[m.key] as number | null} onSave={(v) => save({ [m.key]: v } as Patch)} />
                </div>
              ))}
            </div>
          </Side>

          <Side title="פרטי הפקה ומעקב" tag="הופק ופורסם">
            <div className="grid grid-cols-2 gap-3">
              <Field label="עלות הפקה ₪"><NumInput wide value={item.production_cost} onSave={(v) => save({ production_cost: v })} /></Field>
              <Field label="זמן הפקה (דקות)"><NumInput wide value={item.production_time_minutes} onSave={(v) => save({ production_time_minutes: v })} /></Field>
            </div>
            <Field label="תאריך פרסום">
              <input type="date" defaultValue={item.published_at?.slice(0, 10) ?? ""} key={item.published_at ?? "none"}
                onChange={(e) => save({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="h-10 w-full rounded-lg px-3 font-body text-[14px]" style={{ border: `1px solid ${T.border}`, background: "#fff" }} />
            </Field>
            <Field label="לינק מעקב (Tracking Link)">
              {(item.platforms.length ? item.platforms : (["instagram"] as const)).map((p) => (
                <div key={p} className="mt-1.5 flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${T.border}`, background: "#FAF7F1" }}>
                  <CopyBtn text={trackingLink(item.id, p)} />
                  <span dir="ltr" className="flex-1 truncate font-mono text-[12px]">{trackingLink(item.id, p).replace("https://", "")}</span>
                </div>
              ))}
            </Field>
          </Side>

          <Side title="הערות ותובנות למייסד" tag="פרטי">
            <Area value={item.notes} onSave={(v) => save({ notes: v })} rows={5} placeholder="מה עבד, מה לא, מה לנסות בגרסה הבאה" />
          </Side>
        </div>
      </div>
    </Shell>
  );
}

/* ── Generate Brief: copy prompt → paste answer → fill ── */

function BriefCard({ item, onFill }: { item: ContentItem; onFill: (p: Patch) => Promise<void> }) {
  const [idea, setIdea] = useState(item.pain_point ?? "");
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    if (!idea.trim()) { setMsg("כתבו כאב או רעיון קודם"); return; }
    const winners = await fetch("/api/admin/content").then((r) => r.json())
      .then((d) => (d.items as ContentItem[] ?? []).filter((i) => i.status === "WINNER" && i.id !== item.id).slice(0, 5))
      .catch(() => []);
    await navigator.clipboard.writeText(buildBriefPrompt({ idea, format: item.format, goal: item.content_goal, winners }));
    setCopied(true); setMsg("הפרומפט הועתק — הדביקו בצ'אט");
    setTimeout(() => setCopied(false), 2000);
  };

  const fill = async () => {
    const { fields, error } = parseBrief(answer);
    if (error) { setMsg(error); return; }
    const status = item.status === "IDEA" || item.status === "APPROVED" ? { status: "SCRIPT" as const } : {};
    await onFill({ ...fields, ...status });
    setAnswer(""); setMsg(`מולאו ${Object.keys(fields).length} שדות`);
  };

  return (
    <Side title="Generate Brief" tag="מחולל בריפים" badge="AI">
      <label className="font-body text-[13px]" style={{ color: T.muted }}>כאב או רעיון חופשי:</label>
      <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={4}
        className="mt-1.5 w-full resize-none rounded-lg p-3 font-body text-[14px] outline-none"
        style={{ border: `1px solid ${T.border}`, background: "#FAF7F1" }} />
      <button onClick={copyPrompt} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg font-body text-[14px] font-semibold"
        style={{ background: T.gold, color: T.dark }}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} העתק פרומפט
      </button>
      <div className="my-4 border-t" style={{ borderColor: T.border }} />
      <label className="font-body text-[13px]" style={{ color: T.muted }}>הדביקו כאן את התשובה:</label>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} dir="auto"
        placeholder="הדבק את פלט ה-LLM (כולל הוקים, שוטים, סקריפט וכו׳)…"
        className="mt-1.5 w-full resize-none rounded-lg p-3 font-body text-[13px] outline-none"
        style={{ border: `1px solid ${T.border}`, background: "#FAF7F1" }} />
      <button onClick={fill} disabled={!answer.trim()}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg font-body text-[14px] disabled:opacity-50"
        style={{ border: `1px solid ${T.border}`, background: "#fff" }}>
        <Upload className="h-4 w-4" /> מלא שדות
      </button>
      {msg && <p className="mt-2 font-body text-[12px]" style={{ color: T.goldT }}>{msg}</p>}
    </Side>
  );
}

/* ── Storyboard: a real table, each cell editable ── */

function Storyboard({ shots, onSave }: { shots: Shot[]; onSave: (s: Shot[]) => void }) {
  const set = (n: number, k: keyof Shot, v: string) =>
    onSave(shots.map((s, i) => (i === n ? { ...s, [k]: k === "shot" ? Number(v) || i + 1 : v } : s)));
  const add = () => onSave([...shots, { shot: shots.length + 1, seconds: "", visual: "", on_screen: "" }]);

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${T.border}` }}>
      <table className="w-full font-body text-[13px]">
        <thead style={{ background: "#F7F3EC", color: T.dark }}>
          <tr>
            <th className="w-14 p-3 text-right">שוט #</th>
            <th className="w-24 p-3 text-right">שניות</th>
            <th className="p-3 text-right">מה רואים (Visual Action)</th>
            <th className="w-[30%] p-3 text-right">כתובית על המסך</th>
          </tr>
        </thead>
        <tbody>
          {shots.map((s, n) => (
            <tr key={n} className="border-t align-top" style={{ borderColor: T.border, background: "#fff" }}>
              <td className="p-3 font-mono font-bold" style={{ color: T.goldT }}>{String(s.shot).padStart(2, "0")}</td>
              <td className="p-1"><Cell value={s.seconds} onSave={(v) => set(n, "seconds", v)} mono /></td>
              <td className="p-1"><Cell value={s.visual} onSave={(v) => set(n, "visual", v)} /></td>
              <td className="p-1"><Cell value={s.on_screen} onSave={(v) => set(n, "on_screen", v)} bold /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className="w-full border-t p-2.5 font-body text-[13px]" style={{ borderColor: T.border, color: T.goldT, background: "#FAF7F1" }}>
        + שוט
      </button>
    </div>
  );
}

/* ── Small parts ── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main dir="rtl" className="min-h-screen px-6 py-8 lg:px-10" style={{ background: T.page, color: T.dark }}>
      <div className="mx-auto max-w-[1380px]">{children}</div>
    </main>
  );
}

function Section({ en, he, aside, children }: { en: string; he: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6 shadow-sm" style={{ background: T.card, border: `1px solid ${T.border}` }}>
      <div className="mb-4 flex items-center justify-between font-body text-[13px]">
        <span className="font-bold" style={{ color: T.goldT }}>{en}{he && <span className="font-semibold"> · {he}</span>}</span>
        {aside && <span style={{ color: T.faint }}>{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Side({ title, tag, badge, children }: { title: string; tag?: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6 shadow-sm" style={{ background: T.card, border: `1px solid ${T.border}` }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {badge && <span className="rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold" style={{ background: "#FBF4E6", color: T.goldT }}>{badge}</span>}
          <h3 className="text-[17px] font-bold" style={{ fontFamily: serif }}>{title}</h3>
        </div>
        {tag && <span className="font-body text-[12px]" style={{ color: T.faint }}>{tag}</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Area({ value, onSave, rows, placeholder }: { value: string | null; onSave: (v: string) => void; rows: number; placeholder?: string }) {
  return (
    <textarea defaultValue={value ?? ""} key={value ?? ""} rows={rows} placeholder={placeholder}
      onBlur={(e) => e.target.value !== (value ?? "") && onSave(e.target.value)}
      className="w-full resize-y rounded-xl p-4 font-body text-[15px] leading-relaxed outline-none focus:ring-1"
      style={{ border: `1px solid ${T.border}`, background: "#FAF7F1", color: T.dark }} />
  );
}

function Cell({ value, onSave, mono, bold }: { value: string; onSave: (v: string) => void; mono?: boolean; bold?: boolean }) {
  return (
    <textarea defaultValue={value} key={value} rows={2}
      onBlur={(e) => e.target.value !== value && onSave(e.target.value)}
      className={`w-full resize-none bg-transparent p-2 outline-none ${mono ? "font-mono text-[12px]" : ""} ${bold ? "font-semibold" : ""}`} />
  );
}

function NumInput({ value, onSave, wide }: { value: number | null; onSave: (v: number | null) => void; wide?: boolean }) {
  return (
    <input type="number" inputMode="numeric" defaultValue={value ?? ""} key={String(value)}
      onBlur={(e) => {
        const v = e.target.value === "" ? null : Number(e.target.value);
        if (v !== value) onSave(v);
      }}
      className={`h-9 rounded-md px-2 text-center font-mono text-[14px] outline-none ${wide ? "w-full" : "w-20"}`}
      style={{ border: `1px solid ${T.border}`, background: "#fff" }} />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-body text-[13px]" style={{ color: T.muted }}>{label}:</div>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, tone }: { value: string; onChange: (v: string) => void; options: [string, string][]; tone?: "gold" }) {
  return (
    <span className="relative">
      <Chip tone={tone}>{options.find(([v]) => v === value)?.[1] ?? value}</Chip>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </span>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 font-body text-[14px]"
      style={{ border: `1px solid ${T.border}`, background: "#fff" }}>{children}</button>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ border: `1px solid ${T.border}`, background: "#fff" }}
      aria-label="העתקה">
      {ok ? <Check className="h-3.5 w-3.5" style={{ color: T.olive }} /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[14px]" style={{ color: T.faint }}>{children}</p>;
}
