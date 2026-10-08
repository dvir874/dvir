import test from "node:test";
import assert from "node:assert/strict";
import { buildBriefPrompt, parseBrief, trackingLink, EDITABLE } from "./content-brief.ts";

test("prompt carries the input, the format and the no-invented-numbers rule", () => {
  const p = buildBriefPrompt({ idea: "אמא שואלת כמה מגיעים", format: "A", goal: "leads" });
  assert.match(p, /אמא שואלת כמה מגיעים/);
  assert.match(p, /עידו ונועה/);
  assert.match(p, /אל תמציא/);
  assert.match(p, /בצניעות/);
});

test("winners appear as references with their business metrics", () => {
  const p = buildBriefPrompt({ idea: "x", format: "B", goal: null, winners: [
    { title: "t", format: "B", hook: "מי עוד לא אישר??", pain_point: "רדיפה", views: 900, whatsapp_clicks: 7, leads: 2, customers: 1 },
  ]});
  assert.match(p, /מי עוד לא אישר\?\?/);
  assert.match(p, /לקוחות 1/);
});

test("parses JSON inside a fenced answer with chatter around it", () => {
  const raw = 'בטח! הנה:\n```json\n{"title":"ת","hook_options":["א","ב","ג"],"storyboard":[{"seconds":"0–2","visual":"v","on_screen":"o"}],"cta":"דברו איתנו"}\n```\nבהצלחה';
  const { fields, error } = parseBrief(raw);
  assert.equal(error, undefined);
  assert.equal(fields.hook, "א"); // falls back to the first option
  assert.equal(fields.storyboard?.[0].shot, 1);
  assert.equal(fields.caption, undefined); // missing stays missing
});

test("broken JSON returns an error, not a half-filled item", () => {
  assert.ok(parseBrief("{ not json").error);
  assert.ok(parseBrief("no braces at all").error);
});

test("tracking link is per item and server-owned fields are not editable", () => {
  assert.match(trackingLink("abcdef12-3456", "tiktok"), /utm_source=tiktok.*utm_campaign=c-abcdef12/);
  assert.ok(!EDITABLE.has("id") && !EDITABLE.has("created_at"));
  assert.ok(EDITABLE.has("production_cost") && EDITABLE.has("content_goal"));
});
