import { Injectable, computed, signal } from '@angular/core';
import { Conversation } from '@core/models/conversation.models';

const LAST_CONVERSATION_KEY = 'talkcore:last-conversation-id';
const GENERAL_CHANNEL_ID = 'general';

const initialConversations: Conversation[] = [
  {
    id: GENERAL_CHANNEL_ID,
    name: 'general',
    type: 'channel',
    icon: 'tag',
    messages: [
      {
        id: 'msg-1',
        conversationId: GENERAL_CHANNEL_ID,
        authorName: 'Mira',
        body: 'Willkommen zurueck in TalkCore.',
        sentAt: new Date('2026-05-01T07:45:00'),
        direction: 'incoming',
      },
      {
        id: 'msg-2',
        conversationId: GENERAL_CHANNEL_ID,
        authorName: 'Du',
        body: 'Danke, ich schaue mir gleich die offenen Themen an.',
        sentAt: new Date('2026-05-01T07:48:00'),
        direction: 'outgoing',
      },
      {
        id: 'msg-3',
        conversationId: GENERAL_CHANNEL_ID,
        authorName: 'Jonas',
        body: 'Das Sprint-Board ist aktualisiert.',
        sentAt: new Date('2026-05-01T08:12:00'),
        direction: 'incoming',
      },
    ],
  },
  {
    id: 'product',
    name: 'product',
    type: 'channel',
    icon: 'tag',
    messages: [
      {
        id: 'msg-4',
        conversationId: 'product',
        authorName: 'Lea',
        body: 'Die neue Chat-Ansicht soll heute in den Review.',
        sentAt: new Date('2026-05-01T09:05:00'),
        direction: 'incoming',
      },
      {
        id: 'msg-5',
        conversationId: 'product',
        authorName: 'Du',
        body: 'Passt. Ich halte Header, Verlauf und Composer nah am bestehenden Design.',
        sentAt: new Date('2026-05-01T09:09:00'),
        direction: 'outgoing',
      },
    ],
  },
  {
    id: 'design',
    name: 'design',
    type: 'channel',
    icon: 'tag',
    messages: [
      {
        id: 'msg-6',
        conversationId: 'design',
        authorName: 'Sam',
        body: 'Bitte die bestehenden Farbvariablen weiterverwenden.',
        sentAt: new Date('2026-05-01T10:20:00'),
        direction: 'incoming',
      },
    ],
  },
  {
    id: 'dm-mira',
    name: 'Mira Klein',
    type: 'dm',
    icon: 'account_circle',
    messages: [
      {
        id: 'msg-7',
        conversationId: 'dm-mira',
        authorName: 'Mira',
        body: 'Hast du kurz Zeit fuer das Auth-Thema?',
        sentAt: new Date('2026-05-01T08:30:00'),
        direction: 'incoming',
      },
      {
        id: 'msg-8',
        conversationId: 'dm-mira',
        authorName: 'Du',
        body: 'Ja, ich bin gleich bei dir.',
        sentAt: new Date('2026-05-01T08:33:00'),
        direction: 'outgoing',
      },
    ],
  },
  {
    id: 'dm-jonas',
    name: 'Jonas Weber',
    type: 'dm',
    icon: 'account_circle',
    messages: [
      {
        id: 'msg-9',
        conversationId: 'dm-jonas',
        authorName: 'Jonas',
        body: 'Ich habe dir die API-Notizen geschickt.',
        sentAt: new Date('2026-05-01T11:15:00'),
        direction: 'incoming',
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly conversationsSignal = signal<Conversation[]>(initialConversations);
  private readonly selectedConversationIdSignal = signal(this.getInitialConversationId());

  readonly conversations = this.conversationsSignal.asReadonly();
  readonly channels = computed(() =>
    this.conversationsSignal().filter((conversation) => conversation.type === 'channel'),
  );
  readonly dms = computed(() =>
    this.conversationsSignal().filter((conversation) => conversation.type === 'dm'),
  );
  readonly selectedConversationId = this.selectedConversationIdSignal.asReadonly();
  readonly selectedConversation = computed(() =>
    this.getConversation(this.selectedConversationIdSignal()),
  );

  selectConversation(conversationId: string): Conversation {
    const conversation = this.getConversation(conversationId) ?? this.getGeneralConversation();

    this.selectedConversationIdSignal.set(conversation.id);
    this.getStorage()?.setItem(LAST_CONVERSATION_KEY, conversation.id);

    return conversation;
  }

  getConversation(conversationId: string | null): Conversation | undefined {
    return this.conversationsSignal().find((conversation) => conversation.id === conversationId);
  }

  getLastConversationId(): string {
    return this.getInitialConversationId();
  }

  sendMessage(conversationId: string, body: string): void {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    const message = {
      id: `msg-${Date.now()}`,
      conversationId,
      authorName: 'Du',
      body: trimmedBody,
      sentAt: new Date(),
      direction: 'outgoing' as const,
    };

    this.conversationsSignal.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
            }
          : conversation,
      ),
    );
  }

  private getInitialConversationId(): string {
    const persistedConversationId = this.getStorage()?.getItem(LAST_CONVERSATION_KEY);

    if (persistedConversationId && this.getConversation(persistedConversationId)) {
      return persistedConversationId;
    }

    return GENERAL_CHANNEL_ID;
  }

  private getGeneralConversation(): Conversation {
    return this.getConversation(GENERAL_CHANNEL_ID) ?? this.conversationsSignal()[0];
  }

  private getStorage(): Pick<Storage, 'getItem' | 'setItem'> | undefined {
    if (
      typeof localStorage === 'undefined' ||
      typeof localStorage.getItem !== 'function' ||
      typeof localStorage.setItem !== 'function'
    ) {
      return undefined;
    }

    return localStorage;
  }
}
