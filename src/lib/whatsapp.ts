/* WhatsApp Cloud API client (Meta, no BSP middleman).

   Used by the admin send station to deliver RSVP invitations as approved
   template messages. Unlike the wa.me flow, a template carries a real image
   header that always renders — WhatsApp never has to crawl our page for a
   link preview, so the invitation art is guaranteed to show.

   Configuration lives entirely in env; if it is absent every call returns a
   disabled result and the caller falls back to the manual wa.me flow. Nothing
   here can break the existing send station. */

const API_VERSION = "v21.0";

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  templateLang: string;
  /** Public URL of the template's header image (Meta re-fetches it per send) */
  headerImageUrl: string;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return null;

  return {
    phoneNumberId,
    accessToken,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "wedding_invitation_regalifnei",
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG ?? "he",
    headerImageUrl:
      process.env.WHATSAPP_HEADER_IMAGE_URL ??
      "https://regalifnei.vercel.app/wedding/wa-template-header.jpg",
  };
}

/* Israeli numbers arrive as 05X-XXXXXXX, 0X-XXXXXXX or already +972.
   Meta wants digits only, in full international form, with no leading +. */
export function toE164(raw: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  /* Bare local number with no leading zero — assume Israeli mobile/landline */
  if (digits.length >= 8 && digits.length <= 9) return `972${digits}`;
  return digits;
}

export interface SendResult {
  ok: boolean;
  /** Meta's message id, when accepted — lets us reconcile delivery reports */
  messageId?: string;
  error?: string;
}

/* Sends one template message.
   `token` fills the dynamic suffix of the URL button, so every guest gets
   their own RSVP link while sharing a single approved template. */
export async function sendInvitation(
  cfg: WhatsAppConfig,
  phone: string,
  token: string,
): Promise<SendResult> {
  const to = toE164(phone);
  if (!to) return { ok: false, error: "invalid phone" };

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: cfg.templateName,
      language: { code: cfg.templateLang },
      components: [
        {
          type: "header",
          parameters: [{ type: "image", image: { link: cfg.headerImageUrl } }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: token }],
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      /* Meta nests the human-readable reason a few levels down */
      const err =
        json?.error?.error_user_msg ??
        json?.error?.message ??
        `HTTP ${res.status}`;
      return { ok: false, error: String(err) };
    }

    return { ok: true, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
