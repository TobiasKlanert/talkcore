export type ConversationType = 'channel' | 'dm';

export type MessageDirection = 'incoming' | 'outgoing';

export interface ConversationMember {
  id: string;
  user: string;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  conversation: string;
  sender: string;
  senderName: string;
  content: string;
  sentAt: Date;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  direction: MessageDirection;
}

export interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  icon: string;
  messages: ChatMessage[];
}

export interface ConversationDto {
  id: string;
  type: ConversationType;
  name: string;
}

export interface MessageDto {
  id: string;
  conversation?: string;
  sender?: string | MessageSenderDto;
  content: string;
  created_at: string;
  updated_at?: string;
  is_edited?: boolean;
}

export interface MessageSenderDto {
  id: string;
  email?: string;
  display_name?: string;
}

export interface SendMessageRequest {
  conversation: string;
  content: string;
}

export interface CreateDirectMessageRequest {
  user_id: string;
}

export interface CreateDirectMessageResponse {
  conversation: string;
}
