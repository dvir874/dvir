"use client";

import { useParams } from "next/navigation";
import RsvpReport from "@/components/RsvpReport";

/* Shareable, read-only RSVP report.
   Same screen as the couple's, reached with a code that grants nothing else. */
export default function SharedReportPage() {
  const { code } = useParams<{ code: string }>();
  return <RsvpReport apiBase={`/api/report/${code}`} />;
}
