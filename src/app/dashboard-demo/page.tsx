import type { Metadata } from "next";
import DashboardDemo from "@/components/DashboardDemo";

export const metadata: Metadata = {
  title: "הדגמת מערכת ניהול אירוע",
  description: "צפו כיצד מנהלים מוזמנים, אישורי הגעה ותזכורות — כל הכלים במקום אחד.",
};

export default function DashboardDemoPage() {
  return <DashboardDemo />;
}
