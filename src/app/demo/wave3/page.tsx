"use client";

// Wave 3 CEO Review — E3-S6 + E3-S7 Couple Dashboard (mocked, no DB)

const T = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  border:   "#E8E0D4",
  olive:    "#6B7B5A",
} as const;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
`;

function CircularProgressArc({ value, label }: { value: number; label: string }) {
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const filled = (Math.min(value, 100) / 100) * arc;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0 24px", position:"relative" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`${label}: ${value}%`} style={{ transform:"rotate(135deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(197,164,109,0.14)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#C5A46D" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}/>
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-46%)", textAlign:"center" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"28px", fontWeight:900, color:T.goldText, margin:0, lineHeight:1 }}>{value}%</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:300, color:T.muted, margin:0 }}>{label}</p>
      </div>
    </div>
  );
}

function QuickCard({ emoji, value, label, caption }: { emoji:string; value:string; label:string; caption:string }) {
  return (
    <div style={{ background:T.cream, borderRadius:"16px", border:`1px solid ${T.border}`, padding:"16px 14px 14px", display:"flex", flexDirection:"column", gap:"2px", minHeight:"88px" }}>
      <span style={{ fontSize:"22px", alignSelf:"flex-end" }}>{emoji}</span>
      <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"28px", fontWeight:700, color:T.dark, margin:0, lineHeight:1 }}>{value}</p>
      <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:300, color:T.muted, margin:0 }}>{label}</p>
      <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"11px", fontWeight:600, color:T.gold, margin:"4px 0 0", letterSpacing:".03em" }}>{caption} ←</p>
    </div>
  );
}

function MilestoneCard({ title, due, cta, urgent }: { title:string; due:string; cta:string; urgent?:boolean }) {
  return (
    <div style={{ background:T.cream, borderRadius:"12px", padding:"12px 14px", border:`1px solid ${urgent ? T.gold : T.border}`, borderRightWidth:urgent ? "3px" : "1px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:600, color:T.dark, margin:"0 0 2px" }}>{title}</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"12px", fontWeight:300, color:T.muted, margin:0 }}>{due}</p>
      </div>
      <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:600, color:T.gold, margin:0, flexShrink:0, paddingRight:"8px" }}>{cta}</p>
    </div>
  );
}

export default function Wave3Demo() {
  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"Heebo,sans-serif", paddingBottom:"80px", maxWidth:"390px", margin:"0 auto", boxShadow:"0 0 40px rgba(0,0,0,0.08)" }}>
      <style>{CSS}</style>

      {/* Header bar */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"sticky", top:0, background:"rgba(253,250,245,0.96)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(197,164,109,0.15)", zIndex:10 }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"18px", fontWeight:700, color:T.gold, margin:0, letterSpacing:".05em" }}>רגע לפני</p>
        <button style={{ background:"none", border:"none", cursor:"pointer", padding:"8px", display:"flex", flexDirection:"column", gap:"5px" }} aria-label="תפריט">
          <div style={{ width:20, height:1.5, background:T.dark, borderRadius:1 }}/>
          <div style={{ width:14, height:1.5, background:T.dark, borderRadius:1 }}/>
          <div style={{ width:20, height:1.5, background:T.dark, borderRadius:1 }}/>
        </button>
      </header>

      {/* E3-S6: Greeting + Countdown */}
      <section style={{ padding:"28px 20px 0", textAlign:"right", animation:"fadeUp .4s ease both" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"32px", fontWeight:700, color:T.dark, margin:"0 0 20px" }}>
          שלום ענבל ונדב
        </p>
        <div>
          <p role="timer" style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"80px", fontWeight:900, color:T.goldText, lineHeight:1, margin:"0 0 4px" }}>
            47
          </p>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"20px", fontWeight:300, color:T.muted, margin:"0 0 4px" }}>ימים</p>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"16px", fontWeight:300, color:T.muted, margin:0 }}>עד היום הגדול 💍</p>
        </div>
      </section>

      {/* E3-S6: Circular Progress Arc */}
      <CircularProgressArc value={72} label="מוכנות" />

      {/* E3-S7: 2×2 Quick Action Grid */}
      <section style={{ padding:"0 16px", animation:"fadeUp .4s ease .1s both" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
          <QuickCard emoji="👥" value="124" label="מגיעים"       caption="אורחים" />
          <QuickCard emoji="🪑" value="62"  label="שובצו"        caption="הושבה" />
          <QuickCard emoji="📋" value="14"  label="משימות נותרו" caption="צ׳קליסט" />
          <QuickCard emoji="💰" value="₪34K" label="נותרו"       caption="תקציב" />
        </div>

        {/* Smart Alert strip */}
        <div style={{ background:"rgba(197,164,109,0.08)", borderRadius:"12px", border:"1px solid rgba(197,164,109,0.25)", padding:"12px 16px", marginBottom:"12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:400, color:T.dark, margin:0 }}>62 אורחים לא שובצו — 47 ימים נותרו</p>
          <span style={{ color:T.gold, fontSize:"16px", flexShrink:0 }}>←</span>
        </div>

        {/* Milestone Cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"16px" }}>
          <MilestoneCard title="סגירת חוזה קייטרינג" due="15 ביולי" cta="סגרו תפריט" urgent />
          <MilestoneCard title="תשלום מקדמה לצלם" due="20 ביולי" cta="שלמו מקדמה" urgent />
          <MilestoneCard title="ביקור באולם" due="1 באוגוסט" cta="קבעו מועד ביקור" />
        </div>

        {/* Inspiration */}
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"14px", fontWeight:400, color:T.muted, fontStyle:"italic", textAlign:"center", padding:"20px 8px 32px", lineHeight:1.7 }}>
          &ldquo;האהבה אינה מסתכלת בשעון — היא פשוט נמצאת שם.&rdquo;
        </p>
      </section>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"390px", background:"rgba(253,250,245,0.97)", backdropFilter:"blur(16px)", borderTop:"1px solid rgba(197,164,109,0.15)", padding:"8px 0 16px", display:"flex", justifyContent:"space-around" }}>
        {[
          { emoji:"🏠", label:"בית",    active:true  },
          { emoji:"👥", label:"אורחים", active:false },
          { emoji:"📋", label:"משימות", active:false },
          { emoji:"🪑", label:"הושבה",  active:false },
          { emoji:"☰",  label:"עוד",    active:false },
        ].map(t => (
          <div key={t.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", padding:"4px 12px" }}>
            {t.active && <div style={{ width:4, height:4, borderRadius:"50%", background:T.gold, marginBottom:"1px" }}/>}
            <span style={{ fontSize:"20px" }}>{t.emoji}</span>
            <span style={{ fontFamily:"Heebo,sans-serif", fontSize:"10px", fontWeight: t.active ? 600 : 300, color: t.active ? T.gold : T.muted }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
