// Messaging abstraction — future-proof for WhatsApp Business API

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface Messenger {
  send(phone: string, text: string): Promise<SendResult>;
  sendBatch(messages: { phone: string; text: string }[]): Promise<SendResult[]>;
  name: string;
}
