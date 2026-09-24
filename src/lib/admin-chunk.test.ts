import test from "node:test";
import assert from "node:assert/strict";
import { splitAdminText, ADMIN_MAX_BYTES } from "./admin-chunk.ts";

const bytes = (s: string) => new TextEncoder().encode(s).length;
const line = (i: number) => `אורח מספר ${i} 05012345${String(i).padStart(2, "0")} https://regalifnei.com/s/abc-${i}`;

test("every part fits — this is the whole point", () => {
  /* 15 of 15 alerts over 1,387 bytes failed. Nothing may leave over the cap. */
  const body = ["🙋 ירון פטיניו ואיילת דוד · בעוד 23 ימים",
    ...Array.from({ length: 40 }, (_, i) => line(i))].join("\n");
  const parts = splitAdminText(body);
  assert.ok(parts.length > 1, "should have split");
  for (const p of parts) assert.ok(bytes(p) <= ADMIN_MAX_BYTES, `${bytes(p)} bytes`);
});

test("bytes, not characters — Hebrew is two per letter", () => {
  /* slice(0, 4000) was the old cap and it never bound anything: 4,000 Hebrew
     characters is about 8,000 bytes. */
  const heb = "א".repeat(600);            /* 600 chars, 1200 bytes */
  assert.ok(bytes(heb) > ADMIN_MAX_BYTES);
  for (const p of splitAdminText(heb)) assert.ok(bytes(p) <= ADMIN_MAX_BYTES);
});

test("a short alert is left exactly alone", () => {
  /* 41 of 41 under 947 bytes arrived. Those must not grow a "(1/1)". */
  const s = "🙋 אורח אחד מחכה לתשובה ממך:\n\nצוף כהן 0528480916";
  assert.deepEqual(splitAdminText(s), [s]);
});

test("never cuts inside a line — a half name is worse than a second message", () => {
  const body = Array.from({ length: 30 }, (_, i) => line(i)).join("\n");
  const rejoined = splitAdminText(body)
    .map(p => p.replace(/\n\(\d+\/\d+\)$/, "")).join("\n");
  assert.equal(rejoined, body);
});

test("parts are numbered so a missing one is visible", () => {
  const parts = splitAdminText(Array.from({ length: 30 }, (_, i) => line(i)).join("\n"));
  parts.forEach((p, i) => assert.match(p, new RegExp(`\\(${i + 1}/${parts.length}\\)$`)));
});

test("one line longer than a whole message still gets through", () => {
  /* manualWorkMessage builds a single run-on line when the template path is
     used — it must not become an empty send. */
  const parts = splitAdminText("מילה ".repeat(400));
  assert.ok(parts.length > 1);
  for (const p of parts) assert.ok(bytes(p) <= ADMIN_MAX_BYTES);
  assert.ok(parts.join(" ").includes("מילה"));
});

test("a URL is not broken in half", () => {
  /* Splitting a link yields two dead links instead of one live one. */
  const url = "https://regalifnei.com/s/4d690e62-e570-43f5-9a3c-65915dbae07b";
  const parts = splitAdminText(Array.from({ length: 20 }, () => `שם 0501234567 ${url}`).join("\n"));
  for (const p of parts) {
    for (const m of p.match(/https:\/\/\S+/g) ?? []) assert.ok(m.endsWith("65915dbae07b"), m);
  }
});

test("empty in, empty out", () => {
  for (const v of ["", "   ", null, undefined]) assert.deepEqual(splitAdminText(v as string), []);
});
