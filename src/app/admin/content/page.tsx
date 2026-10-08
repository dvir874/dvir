"use client";

/* Content Hub — list. Stitch screen f8cae5e1, approved 08/10/2026.
 *
 * Two departures from the render, both about honesty: Stitch filled the KPI
 * tiles with sub-lines it invented ("המרה 21%", "יחס הקלקה גבוה בטיקטוק"), and
 * those become "מכל הסרטונים שפורסמו" — a number with no source is exactly what
 * this hub exists to stop. And the KPI order is the business order from the
 * brief: customers, leads, WhatsApp, views — views last and quietest.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FILTERS, type ContentItem } from "@/lib/content-brief";
import { Chip, FormatChip, GoalChip, Platforms, StatusBadge, T, fmtDate, fmtNum, serif } from "./_ui";

const PUBLISHED = new Set(["PUBLISHED", "ANALYZING", "WINNER"]);

export default function ContentHub() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setItems(d.items)))
      .catch(() => setError("טעינה נכשלה"));
  }, []);

  const totals = useMemo(() => {
    const pub = (items ?? []).filter((i) => PUBLISHED.has(i.status));
    const sum = (k: keyof ContentItem) => pub.reduce((a, i) => a + (Number(i[k]) || 0), 0);
    return { customers: sum("customers"), leads: sum("leads"), whatsapp: sum("whatsapp_clicks"), views: sum("views") };
  }, [items]);

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return (items ?? []).filter((i) => !f.statuses || f.statuses.includes(i.status));
  }, [items, filter]);

  const create = async () => {
    setCreating(true);
    const r = await fetch("/api/admin/content", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "סרטון חדש" }),
    }).then((x) => x.json()).catch(() => null);
    setCreating(false);
    if (r?.item) router.push(`/admin/content/${r.item.id}`);
    else setError(r?.error ?? "יצירה נכשלה");
  };

  const kpis = [
    { label: "לקוחות שנסגרו", value: totals.customers, dot: T.olive, big: true },
    { label: "לידים", value: totals.leads, dot: T.gold, big: true },
    { label: "קליקים לוואטסאפ", value: totals.whatsapp, dot: "#E3DCCD", big: true },
    { label: "צפיות כוללות", value: totals.views, dot: "#CFC8BC", big: false },
  ];

  return (
    <main dir="rtl" className="min-h-screen px-6 py-10 lg:px-14" style={{ background: T.page, color: T.dark }}>
      <div className="mx-auto max-w-[1330px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b pb-8" style={{ borderColor: T.border }}>
          <div>
            <div className="flex items-center gap-3 font-body text-[14px]">
              <Link href="/admin" style={{ color: T.dark }}>← ניהול</Link>
              <span className="h-1 w-1 rounded-full" style={{ background: T.border }} />
              <Chip tone="gold">רגע לפני · מערכת ניהול</Chip>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <h1 className="text-[34px] font-bold leading-none" style={{ fontFamily: serif }}>Content Hub</h1>
              <span className="font-body text-[15px]" style={{ color: T.muted }}>רעיון ← הפקה ← פרסום ← תוצאות</span>
            </div>
          </div>
          <button onClick={create} disabled={creating}
            className="inline-flex h-12 items-center gap-2 rounded-full px-7 font-body text-[15px] font-semibold shadow-sm disabled:opacity-60"
            style={{ background: T.gold, color: T.dark }}>
            <Plus className="h-4 w-4" /> {creating ? "יוצר…" : "תוכן חדש"}
          </button>
        </div>

        {/* KPIs — business order */}
        <div className="mt-9 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl p-6 shadow-sm" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 font-body text-[14px]" style={{ color: k.big ? T.dark : T.muted }}>
                <span className="h-2 w-2 rounded-full" style={{ background: k.dot }} />{k.label}
              </div>
              <div className="mt-3 font-bold leading-none" style={{ fontFamily: serif, fontSize: k.big ? 40 : 32, color: k.big ? T.dark : T.muted }}>
                {items ? k.value.toLocaleString("he-IL") : "…"}
              </div>
              <div className="mt-3 font-body text-[12px]" style={{ color: T.faint }}>מכל הסרטונים שפורסמו</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {FILTERS.map((f) => {
            const n = (items ?? []).filter((i) => !f.statuses || f.statuses.includes(i.status)).length;
            const on = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-5 font-body text-[14px]"
                style={on ? { background: T.gold, color: T.dark, fontWeight: 700 }
                  : { background: T.card, border: `1px solid ${f.key === "winners" ? "#EBDDBF" : T.border}`, color: f.key === "winners" ? T.goldT : T.dark }}>
                {f.key === "winners" && "★ "}{f.label} <span style={{ color: on ? T.dark : T.faint }}>({n})</span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-6 font-body text-[14px]" style={{ color: T.warn }}>{error}</p>}

        {/* Cards */}
        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((i) => <Card key={i.id} item={i} />)}
        </div>
        {items && !shown.length && (
          <p className="mt-10 text-center font-body text-[15px]" style={{ color: T.muted }}>אין כאן עדיין סרטונים.</p>
        )}

        <div className="mt-14 flex flex-col items-center gap-3 border-t pt-10" style={{ borderColor: T.border }}>
          <span className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-[14px]"
            style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <span className="h-2 w-2 rounded-full" style={{ background: T.olive }} />
            התחילו מ-5 סרטונים. רק פורמט שמביא לידים ממשיך.
          </span>
        </div>
      </div>
    </main>
  );
}

function Card({ item: i }: { item: ContentItem }) {
  const published = PUBLISHED.has(i.status);
  const winner = i.status === "WINNER";
  const killed = i.status === "KILLED";
  const next = i.status === "IDEA" || i.status === "APPROVED" ? "פתח תסריט" : i.status === "KILLED" ? "" : "ערוך סקריפט";

  return (
    <Link href={`/admin/content/${i.id}`}
      className="flex flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md"
      style={{ background: T.card, border: winner ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>
      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge s={i.status} />
          <span className={killed ? "line-through opacity-60" : ""}><FormatChip f={i.format} /></span>
        </div>
        <h3 className={`mt-5 text-[22px] font-bold leading-snug ${killed ? "line-through opacity-50" : ""}`} style={{ fontFamily: serif }}>
          {i.title || "ללא שם"}
        </h3>
        {(i.pain_point || i.hook) && (
          <p className="mt-3 line-clamp-2 font-body text-[14px] leading-relaxed" style={{ color: T.muted }}>
            {i.pain_point || i.hook}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-2">
          <span className="font-mono text-[12px]" style={{ color: T.faint }}>{fmtDate(i.published_at ?? i.created_at)}</span>
          <GoalChip g={i.content_goal} />
        </div>
        <div className="mt-5">
          <Platforms list={i.platforms} label={published ? "פורסם ב:" : "מתוכנן ל:"} />
        </div>
      </div>

      {published ? (
        <div className="grid grid-cols-4 border-t" style={{ borderColor: T.border }}>
          {[["לקוחות", i.customers], ["לידים", i.leads], ["וואטסאפ", i.whatsapp_clicks], ["צפיות", i.views]].map(([l, v], n) => (
            <div key={l as string} className="py-4 text-center" style={{ borderInlineStart: n ? `1px solid ${T.border}` : undefined }}>
              <div className="font-body text-[12px]" style={{ color: T.faint }}>{l}</div>
              <div className="mt-1 font-mono text-[16px] font-bold" style={{ color: n === 3 ? T.muted : n === 1 ? T.goldT : n === 0 ? T.olive : T.dark }}>
                {fmtNum(v as number | null)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-7 flex items-center justify-between border-t py-4 font-body text-[13px]" style={{ borderColor: T.border }}>
          <span style={{ color: killed ? T.warn : T.faint }}>
            {killed ? `${i.leads ?? 0} לידים מתוך ${fmtNum(i.views)} צפיות` : i.hook ? "יש Hook" : "ממתין לכתיבת Hook"}
          </span>
          {next && <span className="font-semibold" style={{ color: T.goldT }}>{next} ←</span>}
        </div>
      )}
    </Link>
  );
}
