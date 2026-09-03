/* Shared between the admin page and the panels lifted out of it.
   Only two names crossed that boundary — the palette and the tab union —
   which is why the split was safe to make at all. */

export const C = {
  cream:   "#F6F1E8",
  ivory:   "#FDFAF5",
  gold:    "#C5A46D",
  goldL:   "#D4BC8A",
  olive:   "#6B7B5A",
  dark:    "#1C1008",
  muted:   "rgba(28,16,8,0.52)",
  border:  "rgba(197,164,109,0.20)",
  borderS: "rgba(197,164,109,0.10)",
};

export type Tab = "guests" | "reminders" | "import-export" | "command-center" | "recommendations" | "couple-view" | "calendar" | "history" | "analytics" | "service-center" | "requests" | "messages" | "design-requests";
