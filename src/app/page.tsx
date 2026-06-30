import Link from "next/link";

/* ── Direction B: Mediterranean Warmth ── */
const C = {
  bg:        "#fcf9f3",
  surface:   "#ffffff",
  surfaceLo: "#f6f3ed",
  text:      "#1c1c18",
  textMuted: "#54433d",
  primary:   "#91472a",   // terracotta
  primaryFx: "#ffdbcf",   // blush
  primaryCt: "#af5e3f",
  secondary: "#556343",   // sage green
  secCt:     "#d5e5bd",
  border:    "rgba(218,193,185,0.45)",
  shadow:    "rgba(194,109,77,0.08)",
};

export default function Home() {
  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif", background: C.bg, color: C.text, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@700;900&display=swap');

        .rl-body { font-family: 'Heebo', sans-serif; }
        .rl-display { font-family: 'Frank Ruhl Libre', serif; }

        @keyframes rl-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes rl-float2 {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .rl-float  { animation: rl-float  6s ease-in-out infinite; }
        .rl-float2 { animation: rl-float2 6s ease-in-out infinite; animation-delay: 2s; }

        .organic  { border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; }
        .organic2 { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }

        .feature-card { transition: box-shadow 0.25s; }
        .feature-card:hover { box-shadow: 0 8px 32px rgba(194,109,77,0.13); }

        .nav-link { transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: #91472a; }

        .cta-btn { transition: opacity 0.15s, transform 0.1s; }
        .cta-btn:hover  { opacity: 0.9; }
        .cta-btn:active { transform: scale(0.97); }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column; }
          .hero-img   { height: 360px; }
          .hide-mobile { display: none !important; }
          .section-pad { padding: 48px 20px; }
          .bento-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(252,249,243,0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        boxShadow: `0 4px 20px ${C.shadow}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div className="rl-display" style={{ fontSize: 24, fontWeight: 900, color: C.primary, letterSpacing: "-0.02em" }}>
            רגע לפני
          </div>
          {/* Nav */}
          <nav className="hide-mobile" style={{ display: "flex", gap: 32 }}>
            {[["#features","פיצ׳רים"],["#how","איך זה עובד"],["#pricing","מחירים"],["#contact","צור קשר"]].map(([href,label]) => (
              <a key={href} href={href} className="nav-link rl-body" style={{ fontSize: 15, fontWeight: 500, color: C.textMuted }}>
                {label}
              </a>
            ))}
          </nav>
          {/* CTA */}
          <a href="https://wa.me/972502060504" target="_blank" rel="noopener noreferrer"
            className="cta-btn" style={{
              background: C.primary, color: "#fff", borderRadius: 9999,
              padding: "10px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
            בואו נתחיל
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "64px 20px 80px", position: "relative", overflow: "hidden" }}>
        {/* blob backgrounds */}
        <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, background:`${C.primaryFx}`, borderRadius:"50%", filter:"blur(80px)", zIndex:0, mixBlendMode:"multiply", opacity:0.45 }} />
        <div style={{ position:"absolute", top:160, left:-80, width:520, height:520, background:C.secCt, borderRadius:"50%", filter:"blur(80px)", zIndex:0, mixBlendMode:"multiply", opacity:0.35 }} />

        <div className="hero-grid" style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:48, position:"relative", zIndex:1 }}>

          {/* Text */}
          <div style={{ flex:"1 1 50%", minWidth:0, textAlign:"right" }}>
            <h1 className="rl-display" style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight:900, color:C.primary, lineHeight:1.15, marginBottom:20 }}>
              רגע לפני –<br/>החבר הכי טוב שלכם<br/>בארגון החתונה
            </h1>
            <p className="rl-body" style={{ fontSize:18, fontWeight:400, color:C.textMuted, lineHeight:1.7, maxWidth:480, marginBottom:32 }}>
              תכנון חתונה לא חייב להיות מלווה בלחץ. מהזמנות דיגיטליות ועד אישורי הגעה בוואטסאפ – הכל במקום אחד, באווירה חמה ונעימה.
            </p>
            <a href="https://wa.me/972502060504" target="_blank" rel="noopener noreferrer"
              className="cta-btn" style={{
                display:"inline-block", background:C.primary, color:"#fff", borderRadius:9999,
                padding:"14px 36px", fontSize:18, fontWeight:700, textDecoration:"none",
                boxShadow:`0 6px 24px rgba(145,71,42,0.3)`, marginBottom:16,
              }}>
              בואו נתחיל →
            </a>
            <div style={{ display:"flex", alignItems:"center", gap:8, color:C.secondary, fontSize:14 }}>
              <span style={{ fontSize:18 }}>✓</span>
              <span>ללא התחייבות. ביטול מתי שתרצו.</span>
            </div>
          </div>

          {/* Image grid */}
          <div className="hero-img" style={{ flex:"1 1 50%", minWidth:0, position:"relative", height:500 }}>
            <div className="organic rl-float" style={{
              position:"absolute", top:0, right:"10%", width:"60%", height:"70%",
              overflow:"hidden", boxShadow:"0 12px 40px rgba(145,71,42,0.18)",
              border:`1px solid ${C.border}`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQq0a9RbzabNgeSDseRiP6TvD5dJZo7FRHl8yEmc-lD4iJrY8-rsKaAusTmxBGHd0EZu22oVZtHvAiueIVYylzRICQCYNi62YoQq5MWOBj8czqZ1uU6GtPMdhZwt8BYIl2SKoOeNMbof2B45c0bmmyv_iNGua7mgVSqElalowx7SK5mUg_Clv_ZLxeNYTa8nnpP5pQc1MTTR0W8SUwK1n7amVZ5RbwqiFb-G_oy2ZWpPuG2FxeT5N1tZM_dqGLZr-86KLfmaJrF4Uu"
                alt="זוג שמח בגן ים-תיכוני"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
            </div>
            <div className="organic2 rl-float2" style={{
              position:"absolute", bottom:"5%", left:"5%", width:"45%", height:"55%",
              overflow:"hidden", boxShadow:"0 8px 28px rgba(145,71,42,0.13)",
              border:`1px solid ${C.border}`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhoDBcCFkgqOsyzi5H9Za6jb_WtrtXIZk6qfv0at6H1sz_YYHiVFO7_13DtQfMgcYmPhD_nqG2HJdkBPGkG6csGJT9GeIb9koCu6wVyiJLU3zOSdom1xTWif32bGMsa1ckw8g7bcQasol8Aw-pkli-4vMgIEjaZAmEvdSvzwNVPP6CW4ziocS7RZOAZm1Yz-o2TyEkvkvPf3Xr_AQfPI0cqZr60o9k0N_arWWo132NjatawgKjfHYcKY2VOjDim20XXHfAti9hevnf"
                alt="שולחן חתונה מרהיב"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
            </div>
            {/* floating stats chip */}
            <div style={{
              position:"absolute", top:"33%", left:-16,
              background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)",
              borderRadius:16, padding:"12px 16px",
              boxShadow:"0 8px 32px rgba(194,109,77,0.15)",
              border:`1px solid ${C.border}`,
              display:"flex", alignItems:"center", gap:12,
            }}>
              <div style={{ width:40, height:40, background:C.secCt, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💚</div>
              <div>
                <div className="rl-body" style={{ fontSize:17, fontWeight:700, color:C.text }}>345 אורחים</div>
                <div className="rl-body" style={{ fontSize:12, color:C.textMuted }}>אישרו הגעה</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section id="features" style={{ padding:"64px 20px", background:C.surface }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 className="rl-display" style={{ fontSize:"clamp(26px,4vw,36px)", fontWeight:900, color:C.primary, marginBottom:12 }}>
              הכל במקום אחד
            </h2>
            <p className="rl-body" style={{ fontSize:17, color:C.textMuted, maxWidth:560, margin:"0 auto", lineHeight:1.7 }}>
              כלים פשוטים ואינטואיטיביים שיעשו לכם סדר בבלאגן, בלי מאמץ מיותר.
            </p>
          </div>

          <div className="bento-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
            {/* WhatsApp — wide */}
            <div className="feature-card" style={{ background:C.bg, borderRadius:24, padding:32, border:`1px solid rgba(218,193,185,0.5)`, boxShadow:`0 4px 20px ${C.shadow}`, overflow:"hidden", position:"relative" }}>
              <div style={{ position:"absolute", bottom:-60, right:-60, width:200, height:200, background:`${C.primaryFx}`, borderRadius:"50%", filter:"blur(40px)", opacity:0.6 }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ width:48, height:48, background:C.primaryCt, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, fontSize:24 }}>💬</div>
                <h3 className="rl-body" style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:8 }}>אישורי הגעה בוואטסאפ</h3>
                <p className="rl-body" style={{ fontSize:15, color:C.textMuted, lineHeight:1.7, marginBottom:28, maxWidth:420 }}>
                  תשכחו מטלפונים מביכים. המערכת שולחת הודעות אישיות וחמות לכל האורחים ומעדכנת סטטוס אוטומטית.
                </p>
                {/* WhatsApp mock */}
                <div style={{ background:C.surface, borderRadius:"12px 12px 0 0", border:`1px solid rgba(218,193,185,0.4)`, borderBottom:"none", padding:16, maxWidth:340 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:C.secCt, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👵</div>
                    <div style={{ background:C.surfaceLo, borderRadius:"12px 12px 12px 0", padding:"10px 14px", maxWidth:"80%", fontSize:14, color:C.text, lineHeight:1.5 }}>
                      היי סבתא שולה! מתרגשים לראותך. תוכלי לאשר הגעה?
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-end", flexDirection:"row-reverse" }}>
                    <div style={{ background:"#d5e5bd", borderRadius:"12px 12px 0 12px", padding:"10px 14px", maxWidth:"80%", fontSize:14, color:"#2d3a1f", lineHeight:1.5 }}>
                      ברור שנגיע! אני וסבא מחכים בקוצר רוח. 💕
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seating */}
            <div className="feature-card" style={{ background:`rgba(213,229,189,0.18)`, borderRadius:24, padding:32, border:`1px solid rgba(213,229,189,0.6)`, boxShadow:`0 4px 20px ${C.shadow}` }}>
              <div style={{ width:48, height:48, background:C.secondary, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, fontSize:24, color:"#fff" }}>🪑</div>
              <h3 className="rl-body" style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:8 }}>סידור הושבה חכם</h3>
              <p className="rl-body" style={{ fontSize:15, color:C.textMuted, lineHeight:1.7, marginBottom:24 }}>
                גרור ושחרר אורחים לשולחנות. המערכת תתריע על כפילויות ותעזור לנהל רזרבות.
              </p>
              <div style={{ position:"relative", width:"100%", aspectRatio:"1", borderRadius:"50%", border:`2px dashed rgba(85,99,67,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", background:`rgba(255,255,255,0.5)`, maxWidth:160, margin:"0 auto" }}>
                <div style={{ width:"50%", height:"50%", background:C.surface, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color:C.secondary, boxShadow:"inset 0 2px 8px rgba(0,0,0,0.04)" }}>שולחן 1</div>
                <div style={{ position:"absolute", top:8, right:"25%", width:14, height:14, background:C.primary, borderRadius:"50%" }} />
                <div style={{ position:"absolute", bottom:12, left:"33%", width:14, height:14, background:C.primaryFx, borderRadius:"50%" }} />
                <div style={{ position:"absolute", top:"50%", left:-6, width:14, height:14, background:C.secondary, borderRadius:"50%" }} />
              </div>
            </div>

            {/* Invitations */}
            <div className="feature-card" style={{ background:C.surface, borderRadius:24, padding:32, border:`1px solid rgba(218,193,185,0.4)`, boxShadow:`0 4px 20px ${C.shadow}` }}>
              <div style={{ width:48, height:48, background:"#ffdcbd", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, fontSize:24 }}>✉️</div>
              <h3 className="rl-body" style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:8 }}>הזמנות דיגיטליות</h3>
              <p className="rl-body" style={{ fontSize:15, color:C.textMuted, lineHeight:1.7 }}>
                עיצובים מרהיבים שמתאימים בדיוק לסגנון האירוע שלכם. נשלחות ישירות בוואטסאפ.
              </p>
            </div>

            {/* Guest management */}
            <div className="feature-card" style={{ background:C.surface, borderRadius:24, padding:32, border:`1px solid rgba(218,193,185,0.4)`, boxShadow:`0 4px 20px ${C.shadow}` }}>
              <div style={{ width:48, height:48, background:C.primaryFx, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, fontSize:24 }}>👥</div>
              <h3 className="rl-body" style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:8 }}>ניהול מוזמנים</h3>
              <p className="rl-body" style={{ fontSize:15, color:C.textMuted, lineHeight:1.7 }}>
                ייבוא מהיר מאנשי קשר, חלוקה לקבוצות – משפחה, חברים, עבודה – ומעקב צמוד.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:"64px 20px", background:C.bg }}>
        <div style={{ maxWidth:960, margin:"0 auto", textAlign:"center" }}>
          <h2 className="rl-display" style={{ fontSize:"clamp(26px,4vw,36px)", fontWeight:900, color:C.primary, marginBottom:12 }}>
            איך זה עובד?
          </h2>
          <p className="rl-body" style={{ fontSize:17, color:C.textMuted, marginBottom:48, lineHeight:1.7 }}>
            שלושה צעדים פשוטים מהרגע הראשון ועד יום החתונה
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {[
              { num:"01", icon:"📋", title:"הוסיפו את האורחים", desc:"ייבוא מאקסל, מאנשי קשר, או הזנה ידנית – בדקות." },
              { num:"02", icon:"📲", title:"שלחו את ההזמנות", desc:"וואטסאפ עם קישור RSVP אישי לכל אורח. פשוט ויפה." },
              { num:"03", icon:"🎉", title:"עקבו בזמן אמת", desc:"ראו מי אישר, מי ביטל, וכמה מגיעים – ישר מהדשבורד." },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} style={{ padding:"28px 20px", background:C.surface, borderRadius:20, border:`1px solid rgba(218,193,185,0.4)`, textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
                <div className="rl-body" style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:"0.1em", marginBottom:8 }}>{num}</div>
                <h3 className="rl-body" style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8 }}>{title}</h3>
                <p className="rl-body" style={{ fontSize:14, color:C.textMuted, lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding:"64px 20px", background:C.surface }}>
        <div style={{ maxWidth:960, margin:"0 auto", textAlign:"center" }}>
          <h2 className="rl-display" style={{ fontSize:"clamp(26px,4vw,36px)", fontWeight:900, color:C.primary, marginBottom:48 }}>
            זוגות אמרו עלינו
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {[
              { name:"ענבל ונדב", text:"חסכנו שעות של עבודה. כל הרשימה, כל האישורים – בלחיצה אחת. ממש קסם.", emoji:"✨" },
              { name:"מיה ואלון", text:"ה-RSVP בוואטסאפ שינה הכל. אפילו סבא שאל אותנו איך עשינו את זה.", emoji:"💌" },
              { name:"נועה ותמיר", text:"פחות לחץ, יותר שמחה. ממש המלצות לכל זוג שמתכנן חתונה.", emoji:"💍" },
            ].map(({ name, text, emoji }) => (
              <div key={name} style={{ background:C.bg, borderRadius:20, padding:"24px 20px", border:`1px solid rgba(218,193,185,0.4)`, textAlign:"right" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{emoji}</div>
                <p className="rl-body" style={{ fontSize:15, color:C.text, lineHeight:1.7, marginBottom:16 }}>{`"${text}"`}</p>
                <div className="rl-body" style={{ fontSize:13, fontWeight:700, color:C.primary }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"64px 20px", background:C.bg }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <h2 className="rl-display" style={{ fontSize:"clamp(26px,4vw,36px)", fontWeight:900, color:C.primary, marginBottom:12 }}>
            מחיר שמתאים לכולם
          </h2>
          <p className="rl-body" style={{ fontSize:17, color:C.textMuted, marginBottom:40, lineHeight:1.7 }}>
            תשלום חד-פעמי. אין חיוב חוזר. אין הפתעות.
          </p>
          <div style={{ background:C.surface, borderRadius:28, padding:"40px 32px", border:`2px solid rgba(145,71,42,0.2)`, boxShadow:`0 12px 48px ${C.shadow}` }}>
            <div className="rl-display" style={{ fontSize:56, fontWeight:900, color:C.primary, lineHeight:1 }}>₪599</div>
            <div className="rl-body" style={{ fontSize:15, color:C.textMuted, marginTop:8, marginBottom:28 }}>לחתונה אחת. תמיד.</div>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 32px", display:"flex", flexDirection:"column", gap:12, textAlign:"right" }}>
              {["ניהול רשימת מוזמנים ללא הגבלה","שליחת RSVP בוואטסאפ","דף אישי לחתונה","סידור הושבה","גלריית תמונות ובקשות","תמיכה טכנית לאורך כל הדרך"].map(f => (
                <li key={f} className="rl-body" style={{ fontSize:15, color:C.text, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ color:C.secondary, fontWeight:700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a href="https://wa.me/972502060504" target="_blank" rel="noopener noreferrer"
              className="cta-btn" style={{
                display:"block", background:C.primary, color:"#fff", borderRadius:9999,
                padding:"16px 0", fontSize:18, fontWeight:700, textDecoration:"none",
                boxShadow:`0 6px 24px rgba(145,71,42,0.28)`,
              }}>
              מתחילים ←
            </a>
            <p className="rl-body" style={{ fontSize:13, color:C.textMuted, marginTop:14 }}>ביטול בכל עת · ללא סיכון</p>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ padding:"64px 20px", background:C.primary, textAlign:"center" }}>
        <h2 className="rl-display" style={{ fontSize:"clamp(26px,4vw,36px)", fontWeight:900, color:"#fff", marginBottom:16 }}>
          מוכנים להתחיל?
        </h2>
        <p className="rl-body" style={{ fontSize:17, color:"rgba(255,255,255,0.8)", marginBottom:32, lineHeight:1.7 }}>
          הצטרפו למאות זוגות שהפכו את תכנון החתונה לחוויה נעימה
        </p>
        <a href="https://wa.me/972502060504" target="_blank" rel="noopener noreferrer"
          className="cta-btn" style={{
            display:"inline-block", background:"#fff", color:C.primary, borderRadius:9999,
            padding:"14px 40px", fontSize:18, fontWeight:700, textDecoration:"none",
            boxShadow:"0 6px 24px rgba(0,0,0,0.15)",
          }}>
          שלחו לנו הודעה ב-WhatsApp 💬
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" style={{ padding:"32px 20px", background:"#1c1c18", textAlign:"center" }}>
        <div className="rl-display" style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:8 }}>רגע לפני</div>
        <p className="rl-body" style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:16 }}>
          © 2024 · כל הזכויות שמורות
        </p>
        <div style={{ display:"flex", gap:24, justifyContent:"center" }}>
          <a href="/privacy" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>פרטיות</a>
          <a href="/terms"   style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>תנאי שימוש</a>
          <a href="https://wa.me/972502060504" target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>WhatsApp</a>
        </div>
      </footer>
    </div>
  );
}
