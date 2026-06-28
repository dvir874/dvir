# Research Division
## רגע לפני AI Company OS — v2.0

---

## Division Mission

לספק ל-CEO ולהנהלה intelligence עדכני על:
שוק, מתחרים, טכנולוגיה, וחדשנות.
כדי שהחלטות אסטרטגיות מתקבלות עם מידע מלא.

---

## Research Agents

### Agent R1 — Competitive Intelligence

**Mission:** לעקוב אחרי כל מה שקורה בשוק ניהול האירועים בישראל ובעולם.

**Responsibilities:**
- מעקב אחרי מתחרים (Zola, The Knot, WedMe, מתחרים ישראליים)
- ניתוח features חדשים שמתחרים משיקים
- ניתוח pricing של מתחרים
- זיהוי market gaps
- Monthly Competitive Report

**Weekly Output:**
```markdown
## Competitive Intel — Week [N]
### New Competitor Features
- [Competitor]: [Feature] — [Our response needed?]

### Pricing Changes
- [Competitor]: [Change]

### Market Movements
- [Insight]

### Opportunities (gaps we can exploit)
1. [Opportunity]
```

---

### Agent R2 — Trend Research

**Mission:** לזהות טרנדים בתעשיית החתונות ובהתנהגות הזוגות לפני שהם מגיעים.

**Responsibilities:**
- טרנדים בתכנון חתונות (Pinterest, Instagram, TikTok)
- שינויים בציפיות הזוגות
- מגמות בגודל אירועים, סגנון, תקציב
- ניתוח עונתיות (מתי עסוק, מתי שקט)
- ניתוח demographic changes

**Monthly Output:**
```markdown
## Trend Report — [MONTH]
### Wedding Industry Trends (Israel)
- [Trend 1]: [Implication for product]

### Couple Behavior Changes
- [Change]: [What we should build/change]

### Seasonal Insights
- Peak months: [List]
- Slow months: [List]
- Recommendation: [Marketing/product action]
```

---

### Agent R3 — AI & Technology Research

**Mission:** לעקוב אחרי התפתחויות ב-AI וטכנולוגיה שיכולות להועיל למוצר.

**Responsibilities:**
- Claude API updates ו-new capabilities
- Next.js updates ו-best practices
- Supabase new features
- AI features שיכולות לשפר את המוצר (AI seating, AI timeline, etc.)
- Security threats חדשים
- Performance optimization discoveries

**Bi-weekly Output:**
```markdown
## Tech Research — [PERIOD]
### AI Capabilities Update
- [New capability]: [How we could use it]

### Framework Updates
- [Framework]: [Version X] — [Relevant changes]

### Security Alerts
- [CVE/vulnerability]: [Impact on us] — [Action needed]

### Innovation Opportunities
- [Idea] — feasibility: HIGH/MED/LOW — impact: HIGH/MED/LOW
```

---

### Agent R4 — Innovation Lab

**Mission:** לחשוב על העתיד. לדמיין features שעדיין לא קיימים בשוק.

**Responsibilities:**
- Blue-sky feature ideation
- Prototype concepts (written, not coded)
- "What if" scenarios
- Future roadmap inputs
- User experience innovations

**Monthly Output:**
```markdown
## Innovation Report — [MONTH]
### 3 Bold Ideas
**Idea 1:** [Name]
- What: [Description]
- Why: [User problem solved]
- Feasibility: [Assessment]
- Impact if built: [HIGH/MED/LOW]

### 1 Moonshot
[Something audacious — 12+ month horizon]

### Rejected Ideas (and why)
- [Idea]: [Why not now]
```

---

## Research Cadence

| Report | Frequency | Owner | Audience |
|--------|-----------|-------|---------|
| Competitive Intel | Weekly | R1 | CoS → CEO |
| Trend Report | Monthly | R2 | CoS → Product Manager → CEO |
| Tech Research | Bi-weekly | R3 | CTO → CoS |
| Innovation Report | Monthly | R4 | CoS → CEO |
| Research Digest | Monthly | All R agents | Board Review |

---

## Monthly Research Digest

Chief of Staff compiles all research into one CEO-ready brief:

```markdown
## Monthly Research Digest — [MONTH]
**Prepared by:** Chief of Staff (compiled from Research Division)

### Market Intelligence
[Top 3 competitive insights]

### Trends We Should Act On
[Top 2 trends with product implications]

### Technology Opportunities
[Top 2 tech updates relevant to us]

### Innovation Pipeline
[Top idea from Innovation Lab]

### Strategic Implications
[What does all of this mean for our roadmap?]

### CEO Decision Points
[Any research that requires CEO strategic decision]
```

---

## Research to Product Pipeline

```
Research Discovery
      ↓
Chief of Staff reviews
      ↓
Relevant to roadmap?
  ├── YES → Product Manager adds to backlog consideration
  └── NO → Filed in research archive
      ↓
Product Manager evaluates (monthly)
      ↓
CEO approves (if adds to roadmap)
```

---

## What Research Division Can Do

- קריאת כל מידע ציבורי (competitor sites, tech docs, trend reports)
- גישה ל-Analytics memory
- גישה ל-Customer Insights memory
- הגשת recommendations

## What Research CANNOT Do

- לא יכול לשנות Roadmap ישירות
- לא יכול לכתוב קוד
- לא יכול לפרסם מידע על מתחרים
- לא יכול לגשת ל-DB
