import test from "node:test";
import assert from "node:assert/strict";
import {
  detectLeadSource, channelFromPath, channelLink, LEAD_CHANNELS, LEAD_WELCOME,
  leadAlertText, shouldRealert, LEAD_REALERT_MS, SALES_WA_PHONE,
} from "./lead-source.ts";

test("the prefilled line of each channel is recognised as that channel", () => {
  for (const ch of ["facebook", "instagram", "tiktok"] as const) {
    assert.deepEqual(detectLeadSource({ body: LEAD_CHANNELS[ch].prefill }), { source: ch, via: "message" });
  }
});

test("a person naming the channel in their own words counts", () => {
  assert.equal(detectLeadSource({ body: "ראיתי אתכם באינסטגרם, כמה זה עולה?" }).source, "instagram");
  assert.equal(detectLeadSource({ body: "saw you on Facebook" }).source, "facebook");
});

test("deleted prefill → direct WhatsApp, never a guess", () => {
  assert.deepEqual(detectLeadSource({ body: "היי, כמה עולה?" }), { source: "whatsapp_direct", via: "none" });
  assert.deepEqual(detectLeadSource({ body: "" }), { source: "whatsapp_direct", via: "none" });
});

test("Meta's referral wins over the text, and only a known host counts", () => {
  assert.deepEqual(detectLeadSource({
    referral: { source_url: "https://fb.me/abc", source_type: "ad" }, body: "ראיתי באינסטגרם",
  }), { source: "facebook", via: "referral" });
  assert.equal(detectLeadSource({ referral: { source_url: "https://www.instagram.com/p/x" } }).source, "instagram");
  assert.equal(detectLeadSource({ referral: { source_url: "https://example.com", source_type: "ad" } }).source,
    "whatsapp_direct");
});

test("routes: only the three channels exist", () => {
  assert.equal(channelFromPath("facebook"), "facebook");
  assert.equal(channelFromPath("TikTok"), "tiktok");
  assert.equal(channelFromPath("google"), null);
  assert.equal(channelFromPath(undefined), null);
});

test("the channel link opens the 077 number with the prefilled line", () => {
  const l = channelLink("facebook");
  assert.ok(l.startsWith(`https://wa.me/${SALES_WA_PHONE}?text=`));
  assert.equal(decodeURIComponent(l.split("text=")[1]), LEAD_CHANNELS.facebook.prefill);
  assert.equal(SALES_WA_PHONE, "972775494850");
});

test("the alert says it is new, where from, who, and how to answer", () => {
  const t = leadAlertText({ isNew: true, source: "facebook", name: "מירב", phone: "972501234567",
    body: "היי! הגעתי מפייסבוק" });
  assert.match(t, /^💍 ליד חדש — רגע לפני/);
  assert.match(t, /מקור: Facebook/);
  assert.match(t, /שם: מירב/);
  assert.match(t, /טלפון: \+972501234567/);
  assert.match(t, /סטטוס: NEW/);
  assert.match(t, /https:\/\/wa\.me\/972501234567/);
  assert.match(leadAlertText({ isNew: false, source: "whatsapp_direct", phone: "1", body: "x" }), /^💬 הודעה מליד/);
});

test("the welcome is the approved wording", () => {
  assert.match(LEAD_WELCOME, /^היי 👋\nברוכים הבאים ל'רגע לפני' 💍/);
  assert.match(LEAD_WELCOME, /מתי החתונה שלכם/);
});

test("an existing lead re-alerts only after a quiet hour", () => {
  const now = Date.parse("2026-10-09T10:00:00Z");
  assert.equal(shouldRealert(null, now), true);
  assert.equal(shouldRealert(new Date(now - 5 * 60_000).toISOString(), now), false);
  assert.equal(shouldRealert(new Date(now - LEAD_REALERT_MS).toISOString(), now), true);
});
