export type { Messenger, SendResult } from "./messenger";
export { WaLinkMessenger } from "./wa-link";

// Factory — swap implementation here when WhatsApp Business API is available
export function createMessenger() {
  // TODO: when WHATSAPP_BUSINESS_TOKEN env is set, return WhatsAppBusinessMessenger
  return new (require("./wa-link").WaLinkMessenger)();
}
