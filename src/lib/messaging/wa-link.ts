import type { Messenger, SendResult } from "./messenger";

// WhatsApp link-based messenger (current implementation)
// Opens wa.me links — no API key needed, no automation, user clicks manually
export class WaLinkMessenger implements Messenger {
  readonly name = "wa-link";

  async send(phone: string, text: string): Promise<SendResult> {
    const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "972");
    const link = `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
    // In a browser context open the link; on server this just returns the link
    if (typeof window !== "undefined") {
      window.open(link, "_blank");
    }
    return { success: true, messageId: link };
  }

  async sendBatch(messages: { phone: string; text: string }[]): Promise<SendResult[]> {
    return Promise.all(messages.map(m => this.send(m.phone, m.text)));
  }

  waLink(phone: string, text: string): string {
    const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "972");
    return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
  }
}
