"use client";
/**
 * /design-system — living showcase of the Wave 0 Product Design Foundation.
 * Internal/dev reference. Additive route — does not touch any existing screen.
 */
import React, { useState } from "react";
import { Users, Calendar, CheckCircle, Heart, Bell, Plus, ArrowLeft, MapPin } from "lucide-react";
import {
  Button, IconButton, Card, StatCard, Badge, Chip, Tag, Avatar,
  Field, Input, Textarea, Select, Switch, Checkbox, RadioGroup,
  Tabs, Dialog, Sheet, ToastProvider, useToast,
  Alert, ProgressBar, Spinner, Skeleton, EmptyState, Timeline,
} from "@/components/ui";
import { color, type as typeScale, font } from "@/design/tokens";
import { textStyle } from "@/design";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ ...textStyle("headlineSm"), color: color.text, marginBottom: 16 }}>{title}</h2>
      <Card pad="lg"><div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>{children}</div></Card>
    </section>
  );
}

function Showcase() {
  const { show } = useToast();
  const [tab, setTab] = useState("all");
  const [sw, setSw] = useState(true);
  const [cb, setCb] = useState(true);
  const [radio, setRadio] = useState("a");
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: color.bg, padding: "40px 24px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <p style={{ ...textStyle("eyebrow"), color: color.primary }}>Wave 0 · Product Design Foundation</p>
        <h1 style={{ ...textStyle("displayLgMobile"), color: color.text, margin: "8px 0 4px" }}>ספריית העיצוב · רגע לפני</h1>
        <p style={{ ...textStyle("bodyMd"), color: color.textMuted, marginBottom: 40 }}>מקור-אמת אחד לכל המוצר. כל הרכיבים token-driven, RTL-native ונגישים.</p>

        <Section title="Typography">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["displayLg", "headlineLg", "headlineMd", "titleLg", "bodyMd", "label", "eyebrow"] as const).map((r) => (
              <div key={r} style={{ ...textStyle(r), color: color.text }}>{r} · רגע לפני {typeScale[r].size}</div>
            ))}
          </div>
        </Section>

        <Section title="Colors">
          {([["primary", color.primary], ["secondary", color.secondary], ["ink", color.text], ["success", color.success], ["warning", color.warning], ["danger", color.danger], ["info", color.info], ["surface", color.surface]] as const).map(([n, c]) => (
            <div key={n} style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: c, border: `1px solid ${color.border}` }} />
              <p style={{ fontSize: 12, color: color.textMuted, marginTop: 6, fontFamily: font.sans }}>{n}</p>
            </div>
          ))}
        </Section>

        <Section title="Buttons">
          <Button>פעולה ראשית</Button>
          <Button variant="secondary">משני</Button>
          <Button variant="outline">מתאר</Button>
          <Button variant="ghost">רפאים</Button>
          <Button variant="danger">מחיקה</Button>
          <Button loading>טוען</Button>
          <Button leadingIcon={<Plus size={16} />}>הוסף אורח</Button>
          <Button trailingIcon={<ArrowLeft size={16} />}>המשך</Button>
          <IconButton aria-label="התראות"><Bell size={20} /></IconButton>
          <IconButton aria-label="הוסף" variant="primary"><Plus size={20} /></IconButton>
        </Section>

        <Section title="Stat Cards">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, width: "100%" }}>
            <StatCard label="אירועים פעילים" value="12" icon={<Calendar size={22} />} tone="secondary" delta={{ text: "+2 החודש", tone: "success" }} />
            <StatCard label="סה״כ מוזמנים" value="2,340" icon={<Users size={22} />} tone="primary" />
            <StatCard label="ממוצע מענה" value="85%" icon={<CheckCircle size={22} />} tone="secondary" />
            <StatCard label="ממוצע בריאות" value="92" icon={<Heart size={22} />} tone="primary" />
          </div>
        </Section>

        <Section title="Badges · Chips · Avatar">
          <Badge tone="success" icon={<CheckCircle size={13} />}>בריא</Badge>
          <Badge tone="warning">תשומת לב</Badge>
          <Badge tone="danger">דחוף</Badge>
          <Badge tone="info">מידע</Badge>
          <Badge tone="neutral">טיוטה</Badge>
          <Chip active>הכל</Chip>
          <Chip>השבוע</Chip>
          <Tag>תגית</Tag>
          <Avatar name="מירב ודביר" />
          <Avatar name="נועה" size="sm" />
        </Section>

        <Section title="Forms">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, width: "100%" }}>
            <Field label="שם מלא" hint="כפי שיופיע בהזמנה"><Input placeholder="מירב כהן" /></Field>
            <Field label="טלפון" error="המספר צריך להיות 05X-XXXXXXX"><Input invalid placeholder="050-0000000" /></Field>
            <Field label="סוג אירוע"><Select><option>חתונה</option><option>חינה</option></Select></Field>
            <Field label="הערה"><Textarea placeholder="משהו שכדאי לדעת…" /></Field>
          </div>
        </Section>

        <Section title="Toggles">
          <Switch checked={sw} onChange={setSw} label="שליחת תזכורות אוטומטית" />
          <Checkbox checked={cb} onChange={setCb} label="אשר הגעה" />
          <RadioGroup name="demo" value={radio} onChange={setRadio} options={[{ value: "a", label: "אופציה א" }, { value: "b", label: "אופציה ב" }]} />
        </Section>

        <Section title="Tabs">
          <div style={{ width: "100%" }}>
            <Tabs value={tab} onChange={setTab} items={[{ id: "all", label: "הכל" }, { id: "urgent", label: "דחוף", badge: 3 }, { id: "week", label: "השבוע" }]} />
          </div>
        </Section>

        <Section title="Feedback">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <Alert tone="success" title="נשמר בהצלחה">24 אורחים יקבלו תזכורת.</Alert>
            <Alert tone="danger" title="לא הצלחנו לשמור">שום דבר לא אבד — נסו שוב בעוד רגע.</Alert>
            <ProgressBar value={78} showLabel />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}><Spinner /><Skeleton width={180} /><Skeleton width={120} height={12} /></div>
          </div>
        </Section>

        <Section title="Overlays · Toast">
          <Button onClick={() => setDialog(true)}>פתח Dialog</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>פתח Bottom Sheet</Button>
          <Button variant="outline" onClick={() => show({ tone: "success", message: "נשלח! 24 אורחים יקבלו תזכורת." })}>הצג Toast</Button>
        </Section>

        <Section title="Empty State · Timeline">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
            <Card pad="none">
              <EmptyState icon={<Users size={28} />} title="עוד אין אורחים" description="בואו נוסיף את הראשונים לרשימה." action={{ label: "הוסף אורח", onClick: () => show({ tone: "info", message: "פתיחת טופס…" }) }} />
            </Card>
            <Card pad="lg">
              <Timeline items={[
                { id: "1", title: <><b>מערכת</b> שלחה תזכורת ל-14 אורחים</>, time: "לפני 15 דקות", tone: "primary" },
                { id: "2", title: <><b>אביבית לוי</b> אישרה הגעה</>, time: "לפני 42 דקות", tone: "success" },
                { id: "3", title: <><b>דביר</b> עדכן את סקיצת השולחנות</>, time: "לפני שעה" },
              ]} />
            </Card>
          </div>
        </Section>
      </div>

      <Dialog open={dialog} onClose={() => setDialog(false)} title="אישור פעולה"
        footer={<><Button onClick={() => setDialog(false)}>אישור</Button><Button variant="ghost" onClick={() => setDialog(false)}>ביטול</Button></>}>
        <p style={{ ...textStyle("bodyMd"), color: color.textSoft }}>זהו Dialog ממורכז עם scrim, blur, Escape-לסגירה ונעילת גלילה.</p>
      </Dialog>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="פעולות מהירות"
        footer={<Button fullWidth onClick={() => setSheet(false)}>סגור</Button>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
          <Button variant="ghost" leadingIcon={<MapPin size={18} />}>שלח מיקום</Button>
          <Button variant="ghost" leadingIcon={<Bell size={18} />}>שלח תזכורת</Button>
        </div>
      </Sheet>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}
