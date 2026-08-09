"use client";

import { useParams } from "next/navigation";
import RsvpReport from "@/components/RsvpReport";

/* The couple's own view of the report, reached with the dashboard token. */
export default function CoupleReportPage() {
  const { token } = useParams<{ token: string }>();
  return <RsvpReport apiBase={`/api/couple/${token}/report`} />;
}
