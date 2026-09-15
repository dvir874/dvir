import test from "node:test";
import assert from "node:assert/strict";
import {
  toLocalIL, smsSegments, readInforuResponse, inforuProvider, smsProvider,
} from "./sms-gateway.ts";

test("a Meta number becomes the local form a gateway expects", () => {
  /* Everything in this system stores 972XXXXXXXXX because that is what Meta
     takes. An Israeli gateway wants 05XXXXXXXX, and at least one of them drops
     the other shape without erroring — a run that reports success while no
     phone rings. */
  assert.equal(toLocalIL("972533318177"), "0533318177");
  assert.equal(toLocalIL("+972-53-331-8177"), "0533318177");
  assert.equal(toLocalIL("0533318177"), "0533318177");
});

test("a foreign number is not bent into an Israeli one", () => {
  /* Rare on these lists, and inventing a 0 in front of a French number sends
     the message to a stranger. */
  assert.equal(toLocalIL("33612345678"), "33612345678");
});

test("Hebrew is counted as UCS-2, because that is what is billed", () => {
  assert.equal(smsSegments(""), 0);
  assert.equal(smsSegments("א".repeat(70)), 1);
  assert.equal(smsSegments("א".repeat(71)), 2);
  /* The real invitation must stay inside one segment — see sms-invite.ts,
     where the link was shortened for exactly this reason. */
  assert.equal(smsSegments("א".repeat(67 * 2)), 2);
});

test("an unrecognised answer is a failure, never a success", () => {
  /* The failure this whole file replaces is silent loss. Anything we cannot
     read must not be reported as delivered. */
  for (const body of ["", "<html>502</html>", "{}", "<Result/>"]) {
    const r = readInforuResponse(body);
    assert.equal(r.ok, false, body);
    if (!r.ok && !("dryRun" in r)) assert.equal(r.permanent, false, body);
  }
});

test("a positive status is an accepted message", () => {
  const r = readInforuResponse("<Result><Status>1</Status><Description>OK</Description></Result>");
  assert.equal(r.ok, true);
});

test("only a bad recipient is permanent — our own problems are retried", () => {
  /* -6 is about the number. Credit, throttling and an unregistered sender are
     ours to fix, and writing the guest off for those loses them for good. */
  const bad = readInforuResponse("<Result><Status>-6</Status><Description>Invalid recipient</Description></Result>");
  assert.equal(bad.ok, false);
  if (!bad.ok && !("dryRun" in bad)) assert.equal(bad.permanent, true);

  for (const s of [-1, -2, -13, 0]) {
    const r = readInforuResponse(`<Result><Status>${s}</Status></Result>`);
    assert.equal(r.ok, false);
    if (!r.ok && !("dryRun" in r)) assert.equal(r.permanent, false, `status ${s}`);
  }
});

test("a dry run builds the whole request and transmits nothing", async () => {
  const p = inforuProvider({ user: "u", token: "t", sender: "RegaLifnei", dryRun: true });
  const r = await p.send("972533318177", "שלום");
  assert.equal(r.ok, false);
  assert.ok("dryRun" in r && r.dryRun === true);
  if ("dryRun" in r) {
    assert.match(r.request.body, /^InforUXML=/);
    assert.ok(r.request.body.includes(encodeURIComponent("0533318177")));
    assert.equal(r.request.method, "POST");
  }
});

test("the message is XML-escaped, so an ampersand cannot break the payload", () => {
  const p = inforuProvider({ user: "u", token: "t", sender: "s", dryRun: true });
  const body = decodeURIComponent(p.preview("0501234567", "דנה & יוסי <3").body.replace("InforUXML=", ""));
  assert.ok(body.includes("דנה &amp; יוסי &lt;3"));
  assert.ok(!body.includes("& יוסי"));
});

test("no credentials means no provider, and the manual path is untouched", () => {
  assert.equal(smsProvider({} as NodeJS.ProcessEnv), null);
});

test("half-configured is not configured", () => {
  /* A username with no token would otherwise reach the gateway and fail once
     per guest per run, twice a day, forever. */
  assert.equal(smsProvider({ SMS_PROVIDER: "inforu", SMS_USER: "u" } as NodeJS.ProcessEnv), null);
  assert.equal(smsProvider({ SMS_PROVIDER: "inforu", SMS_USER: "u", SMS_TOKEN: "t" } as NodeJS.ProcessEnv), null);
});

test("an unknown provider name is refused rather than guessed", () => {
  assert.equal(smsProvider({
    SMS_PROVIDER: "cellact", SMS_USER: "u", SMS_TOKEN: "t", SMS_SENDER: "s",
  } as NodeJS.ProcessEnv), null);
});

test("a full configuration produces a provider", () => {
  const p = smsProvider({
    SMS_PROVIDER: "inforu", SMS_USER: "u", SMS_TOKEN: "t", SMS_SENDER: "s",
  } as NodeJS.ProcessEnv);
  assert.equal(p?.name, "inforu");
});
