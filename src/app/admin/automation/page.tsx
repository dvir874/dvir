import { redirect } from "next/navigation";

/* Deprecated — merged into /admin/automations. Kept as redirect per route-stability policy. */
export default function AutomationRedirect() {
  redirect("/admin/automations");
}
