export type ConversationType = 'channel' | 'dm';

export interface ChatMessage {
  id: string;
  conversationId: string;
  authorName: string;
  body: string;
  sentAt: Date;
  direction: 'incoming' | 'outgoing';
}

export interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  icon: string;
  messages: ChatMessage[];
}
