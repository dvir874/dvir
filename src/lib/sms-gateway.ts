/** Sending an SMS without Dvir's thumb.
 *
 * A guest whose number has no WhatsApp comes back as 131026, and until now
 * that guest fell on Dvir: /admin/sms builds the message and he taps `sms:`
 * links on his own phone, one per guest, for every wedding. Thirty of ירון
 * ואיילת's are in that state before a single invitation has gone out.
 *
 * DIGINET and M-event both send SMS automatically and charge for it. This is
 * the one gap in the competitor analysis that costs Dvir hours rather than
 * sales, and the whole premise of the business is that the phone is not where
 * the work happens.
 *
 * ── Why this file looks paranoid ──────────────────────────────────────────
 *
 * It is written against an API I have not been able to call. There is no
 * account yet, so nothing here has round-tripped against a live gateway, and
 * an SMS layer that is merely plausible is worse than none: it sends real
 * messages to real guests at a real wedding.
 *
 * So three things hold it shut:
 *
 *   1. No credentials in the environment → `smsProvider()` returns null and
 *      every caller falls back to the manual path exactly as today.
 *   2. SMS_DRY_RUN=true → the request is built in full and returned for
 *      inspection, and nothing is transmitted. This is how the payload gets
 *      checked against the provider's own documentation before a guest is
 *      ever involved.
 *   3. The provider is behind an interface. If 019 or Cellact turns out to be
 *      the right supplier, that is a new adapter and nothing else changes.
 *
 * Turn it on only after a dry run has been read and one message to Dvir's own
 * number has arrived. */

/** A number that cannot receive is a fact about the number; everything else is
    worth retrying. Callers use this to decide whether to try again tomorrow. */
export type SmsResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string; permanent: boolean }
  | { ok: false; dryRun: true; request: SmsRequest; error: "dry_run"; permanent: false };

export interface SmsRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

export interface SmsProvider {
  name: string;
  /** `to` is E.164 without the plus, as the rest of this system stores it. */
  send(to: string, body: string): Promise<SmsResult>;
  /** The exact request that `send` would make, transmitted to nobody. */
  preview(to: string, body: string): SmsRequest;
}

/* ── Israeli numbers as a gateway wants them ──────────────────────────────
 *
 * Meta is given 972XXXXXXXXX. Israeli SMS gateways expect the local 05XXXXXXXX
 * form, and one of them silently drops anything else rather than erroring —
 * which is the failure mode where the run reports success and no phone rings.
 * Foreign numbers keep their international shape; they are rare on these lists
 * and mangling them into an Israeli prefix would be worse than leaving them. */
export function toLocalIL(phone: string): string {
  const d = String(phone ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) return "0" + d.slice(3);
  if (d.startsWith("0")) return d;
  return d;
}

/** Hebrew is UCS-2: 70 characters a segment, 67 once a message is split. The
    number of segments is the number of messages billed. */
export function smsSegments(body: string): number {
  const n = [...String(body ?? "")].length;
  if (n === 0) return 0;
  return n <= 70 ? 1 : Math.ceil(n / 67);
}

function xmlEscape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export interface InforuConfig {
  user: string;
  token: string;
  /** The sender name or number the recipient sees. Must be registered with
      the provider; an unregistered sender is silently dropped by some. */
  sender: string;
  dryRun: boolean;
  endpoint?: string;
}

const INFORU_ENDPOINT = "https://api.inforu.co.il/SendMessageXml.ashx";

/** InforU Mobile (Shamir). Payload shape per the published API: a POST of
    form-encoded `InforUXML` carrying user, sender, message and recipients. */
export function inforuProvider(cfg: InforuConfig): SmsProvider {
  const url = cfg.endpoint ?? INFORU_ENDPOINT;

  const preview = (to: string, body: string): SmsRequest => {
    const xml =
      `<Inforu>` +
        `<User><Username>${xmlEscape(cfg.user)}</Username>` +
        `<ApiToken>${xmlEscape(cfg.token)}</ApiToken></User>` +
        `<Content Type="sms"><Message>${xmlEscape(body)}</Message></Content>` +
        `<Recipients><PhoneNumber>${xmlEscape(toLocalIL(to))}</PhoneNumber></Recipients>` +
        `<Settings><Sender>${xmlEscape(cfg.sender)}</Sender></Settings>` +
      `</Inforu>`;
    return {
      url, method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" },
      body: "InforUXML=" + encodeURIComponent(xml),
    };
  };

  return {
    name: "inforu",
    preview,
    async send(to, body) {
      const req = preview(to, body);
      if (cfg.dryRun) return { ok: false, dryRun: true, request: req, error: "dry_run", permanent: false };

      let res: Response;
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 15_000);
        res = await fetch(req.url, {
          method: req.method, headers: req.headers, body: req.body, signal: ctl.signal,
        });
        clearTimeout(t);
      } catch (e) {
        /* A network failure says nothing about the number. */
        return { ok: false, error: `network: ${(e as Error).message}`, permanent: false };
      }

      const text = await res.text().catch(() => "");
      if (!res.ok) return { ok: false, error: `http ${res.status}: ${text.slice(0, 200)}`, permanent: false };
      return readInforuResponse(text);
    },
  };
}

/** The gateway answers with XML carrying a numeric Status. Positive is the
 *  number of messages accepted; zero or negative is a failure code.
 *
 *  Parsed leniently on purpose: an unrecognised body is treated as a failure
 *  that may be retried, never as a success. A send layer that reads "unknown"
 *  as "sent" loses the guest silently, and silent loss is the exact failure
 *  this replaces. */
export function readInforuResponse(text: string): SmsResult {
  const status = Number(/<Status>(-?\d+)<\/Status>/.exec(text)?.[1] ?? NaN);
  const desc = /<Description>([\s\S]*?)<\/Description>/.exec(text)?.[1]?.trim() ?? "";
  const id = /<NumberOfRecipients>|<ID>(\d+)<\/ID>/.exec(text)?.[1] ?? null;

  if (Number.isFinite(status) && status > 0) return { ok: true, id };

  /* -6 is an invalid recipient in InforU's table: that is about the number and
     retrying it tomorrow will fail identically. Everything else — credit,
     throttling, an unregistered sender — is ours to fix, so it stays retryable
     and the guest is not written off for a problem on our side. */
  const permanent = status === -6;
  return {
    ok: false,
    error: `status ${Number.isFinite(status) ? status : "?"}${desc ? `: ${desc}` : ""}`,
    permanent,
  };
}

/** The configured provider, or null when SMS is not set up — in which case
    every caller must behave exactly as it did before this file existed. */
export function smsProvider(env: NodeJS.ProcessEnv = process.env): SmsProvider | null {
  const name = (env.SMS_PROVIDER ?? "").trim().toLowerCase();
  if (!name) return null;

  const user = (env.SMS_USER ?? "").trim();
  const token = (env.SMS_TOKEN ?? "").trim();
  const sender = (env.SMS_SENDER ?? "").trim();
  const dryRun = env.SMS_DRY_RUN === "true";

  /* Half-configured is not configured. A missing token with a present username
     would otherwise reach the gateway and fail once per guest per run. */
  if (!user || !token || !sender) return null;

  if (name === "inforu") return inforuProvider({ user, token, sender, dryRun });
  return null;
}
