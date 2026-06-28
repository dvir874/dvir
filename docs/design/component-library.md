# Component Library · רפרנס

> מקור: [`src/components/ui/`](../../src/components/ui). ייבוא: `import { Button, Card, Badge } from "@/components/ui";`
> כל רכיב: token-driven · RTL-native · נגיש · עם 44px tap targets במובייל.

## Primitives שנבנו ב-Wave 0

| רכיב | תיאור | Props עיקריים |
|------|-------|----------------|
| `Button` | הכפתור היחיד | `variant` (primary/secondary/outline/ghost/danger), `size` (sm/md/lg), `loading`, `fullWidth`, `leadingIcon`, `trailingIcon` |
| `IconButton` | כפתור אייקון | `aria-label` (חובה), `size`, `variant` (ghost/soft/primary) |
| `Card` | משטח צף | `pad`, `interactive`, `variant` (elevated/flat) |
| `StatCard` | יחידת KPI | `label`, `value`, `icon`, `tone`, `delta` |
| `Badge` | פיל סטטוס | `tone` (success/warning/danger/info/neutral/primary), `icon` |
| `Chip` | פיל בחירה/פילטר | `active` |
| `Tag` | תווית נייטרלית | — |
| `Avatar` | עיגול תמונה/ראשי תיבות | `src`, `name`, `size` |
| `Field` | עטיפת label+hint+error | `label`, `hint`, `error`, `required` |
| `Input` / `Textarea` / `Select` | שדות טופס | `invalid` + native props |
| `TextField` | קלט+תווית במכה אחת | props של Field+Input |
| `Switch` / `Checkbox` / `RadioGroup` | toggles מבוקרים | `checked`/`value`, `onChange` |
| `Tabs` | סגמנט-קונטרול | `value`, `onChange`, `items` (id/label/badge) |
| `Dialog` | מודאל ממורכז | `open`, `onClose`, `title`, `footer` |
| `Sheet` | Bottom sheet (מובייל) | כמו Dialog + ידית גרירה + safe-area |
| `ToastProvider` + `useToast()` | משוב לא-חוסם | `show({ tone, message })` |
| `Alert` | באנר inline | `tone`, `title` |
| `ProgressBar` | התקדמות | `value`, `tone`, `showLabel` |
| `Spinner` / `Skeleton` | מצבי טעינה | — / `width`,`height` |
| `EmptyState` / `ErrorState` / `SuccessState` | מצבי מסך מנחים | `icon`, `title`, `description`, `action`, `secondaryAction` |
| `Timeline` | פיד פעילות אנכי (RTL) | `items` (id/title/time/tone) |

## דוגמה

```tsx
import { Card, StatCard, Button, Badge, useToast } from "@/components/ui";
import { Users } from "lucide-react";

const { show } = useToast();

<StatCard label="סה״כ מוזמנים" value="2,340" icon={<Users size={22} />} tone="primary" />
<Button onClick={() => show({ tone: "success", message: "נשמר!" })}>שמור</Button>
<Badge tone="success" icon={<Check size={13} />}>בריא</Badge>
```

## ספריית-המשך (spec ל-Stitch לפני מימוש)

רכיבים מורכבים שיעוצבו ב-Stitch וייבנו לפי הצורך בגלים: `Table` · `Accordion` · `Dropdown` · `Tooltip` · `Drawer` · `Calendar` · `DatePicker` · `Stepper/Wizard` · `SegmentedProgress`.
