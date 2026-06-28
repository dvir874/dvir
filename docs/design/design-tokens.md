# Design Tokens · רפרנס

> מקור-האמת בקוד: [`src/design/tokens.ts`](../../src/design/tokens.ts). מסמך זה מסכם. **לעולם לא לכתוב ערך גולמי במסך** — לייבא מ-`@/design`.

```ts
import { color, type, space, radius, shadow, duration, easing, z } from "@/design";
import { textStyle } from "@/design";
```

## Color (סמנטי — השתמש באלה)

| תפקיד | טוקן | ערך |
|-------|------|-----|
| רקע עמוד | `color.bg` | `#FDFAF5` |
| משטח (סקשן) | `color.surface` | `#F6F1E8` |
| כרטיס צף | `color.surfaceRaised` | `#FFFFFF` |
| כהה (הירו/sidebar) | `color.surfaceInverse` | `#1C1008` |
| טקסט | `color.text` / `textSoft` / `textMuted` / `textFaint` | `#1C1008` → α |
| Primary (זהב) | `color.primary` / `primaryHover` | `#C5A46D` / `#A07840` |
| Secondary (זית) | `color.secondary` | `#6B7B5A` |
| Success | `color.success` (+ `successContainer`) | `#6B7B5A` / `#DCE6D1` |
| Warning | `color.warning` (+ container) | `#A07840` |
| Danger | `color.danger` (+ `dangerContainer`) | `#B24C4C` / `#FFDAD6` |
| Info | `color.info` (+ container) | `#5E7A99` |
| גבול | `color.border` / `borderStrong` / `borderFaint` | gold α |
| Focus ring | `color.focus` | gold 0.55α |

> Dark theme מוכן ב-`colorDark` (טרם מופעל).

## Typography (`type.*` + `textStyle()`)

`displayLg` 48/900 · `headlineLg` 32/700 · `headlineMd` 24/700 · `headlineSm` 20/700 · `titleLg` 18/600 · `bodyLg` 18 · `bodyMd` 16 · `bodySm` 14 · `label` 14/600 · `labelSm` 12 · `eyebrow` 12/700 UPPERCASE.
Families: `font.serif` (Frank Ruhl Libre — כותרות), `font.sans` (Heebo — גוף/UI).

## Spacing (`space.*`, בסיס 8px)

`1`=4 · `2`=8 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 · `16`=64 …

## Radius (`radius.*`)

`xs`=8 · `sm`=12 · `md`=16 · `lg`=20 (ברירת מחדל לכרטיסים/קלטים) · `xl`=24 · `2xl`=32 (הירו) · `pill`=9999.

## Shadow (`shadow.*`)

`xs` · `card` (כרטיס צף) · `raised` (hover) · `float` (popover) · `modal` (dialog) · `focus`.

## Motion · Z · עוד

`duration` (instant/fast/base/slow/slower) · `easing` (standard/out/in/spring) · `z` (header/sidebar/dialog/toast/tooltip…) · `breakpoint` · `container` · `tapTarget.min`=44px · `safeArea` · `rtl`.

## מקבילות Tailwind (additive)

צבעים: `bg-ink bg-ivory bg-surface bg-surface-raised text-primary bg-primary text-secondary bg-success-soft text-danger border-line …`
צללים: `shadow-card shadow-raised shadow-float shadow-modal` · רדיוס: `rounded-card rounded-hero rounded-pill rounded-field` · פונט: `font-display font-body` · אנימציה: `animate-rl-scale-in animate-rl-slide-up animate-rl-toast-in`.
