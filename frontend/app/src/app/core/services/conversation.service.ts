import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';

import { API_BASE_URL } from '@core/constants/api.constants';
import {
  ChatMessage,
  Conversation,
  ConversationDto,
  CreateDirectMessageRequest,
  CreateDirectMessageResponse,
  MessageDto,
  SendMessageRequest,
} from '@core/models/conversation.models';
import { AuthService } from '@core/services/auth.service';

const LAST_CONVERSATION_KEY = 'talkcore:last-conversation-id';

const CONVERSATION_API_PATHS = {
  conversations: `${API_BASE_URL}/conversations/`,
  messages: `${API_BASE_URL}/messages/`,
  conversationMessages: (conversationId: string) =>
    `${API_BASE_URL}/conversations/${conversationId}/messages/`,
  createDirectMessage: `${API_BASE_URL}/conversations/create-dm/`,
};

interface ApiListResponse<T> {
  results: T[];
}

type ListResponse<T> = T[] | ApiListResponse<T>;

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly conversationsSignal = signal<Conversation[]>([]);
  private readonly selectedConversationIdSignal = signal<string | null>(
    this.getStorage()?.getItem(LAST_CONVERSATION_KEY) ?? null,
  );

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

  loadConversations(): Observable<Conversation[]> {
    return this.http.get<ListResponse<ConversationDto>>(CONVERSATION_API_PATHS.conversations).pipe(
      map((response) => this.extractList(response).map((dto) => this.mapConversation(dto))),
      tap((conversations) => this.setConversations(conversations)),
    );
  }

  loadConversation(conversationId: string): Observable<Conversation | undefined> {
    const cachedConversation = this.getConversation(conversationId);

    if (cachedConversation) {
      return of(cachedConversation);
    }

    return this.loadConversations().pipe(
      map((conversations) =>
        conversations.find((conversation) => conversation.id === conversationId),
      ),
    );
  }

  loadMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http
      .get<ListResponse<MessageDto>>(CONVERSATION_API_PATHS.conversationMessages(conversationId))
      .pipe(
        map((response) =>
          this.extractList(response).map((dto) => this.mapMessage(dto, conversationId)),
        ),
        tap((messages) => this.setConversationMessages(conversationId, messages)),
      );
  }

  sendMessage(conversationId: string, content: string): Observable<ChatMessage | null> {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return of(null);
    }

    const payload: SendMessageRequest = {
      conversation: conversationId,
      content: trimmedContent,
    };

    return this.http.post<MessageDto>(CONVERSATION_API_PATHS.messages, payload).pipe(
      map((dto) => this.mapMessage(dto, conversationId, trimmedContent)),
      tap((message) => this.appendConversationMessage(conversationId, message)),
    );
  }

  createDirectMessage(
    payload: CreateDirectMessageRequest,
  ): Observable<CreateDirectMessageResponse> {
    return this.http.post<CreateDirectMessageResponse>(
      CONVERSATION_API_PATHS.createDirectMessage,
      payload,
    );
  }

  selectConversation(conversationId: string): Conversation | undefined {
    const conversation = this.getConversation(conversationId);

    this.selectedConversationIdSignal.set(conversationId);
    this.getStorage()?.setItem(LAST_CONVERSATION_KEY, conversationId);

    return conversation;
  }

  selectFirstConversation(): Conversation | undefined {
    const conversation = this.conversationsSignal()[0];

    if (conversation) {
      this.selectConversation(conversation.id);
    }

    return conversation;
  }

  getConversation(conversationId: string | null): Conversation | undefined {
    return this.conversationsSignal().find((conversation) => conversation.id === conversationId);
  }

  getLastConversationId(): string | null {
    return (
      this.selectedConversationIdSignal() ??
      this.getStorage()?.getItem(LAST_CONVERSATION_KEY) ??
      null
    );
  }

  private setConversations(nextConversations: Conversation[]): void {
    const existingConversations = this.conversationsSignal();

    this.conversationsSignal.set(
      nextConversations.map((conversation) => {
        const existingConversation = existingConversations.find(
          (existing) => existing.id === conversation.id,
        );

        return existingConversation
          ? { ...conversation, messages: existingConversation.messages }
          : conversation;
      }),
    );
  }

  private setConversationMessages(conversationId: string, messages: ChatMessage[]): void {
    this.conversationsSignal.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, messages } : conversation,
      ),
    );
  }

  private appendConversationMessage(conversationId: string, message: ChatMessage): void {
    this.conversationsSignal.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation,
      ),
    );
  }

  private mapConversation(dto: ConversationDto): Conversation {
    return {
      id: dto.id,
      name: dto.name || (dto.type === 'channel' ? 'Unbenannter Channel' : 'Direct Message'),
      type: dto.type,
      icon: dto.type === 'channel' ? 'tag' : 'account_circle',
      messages: [],
    };
  }

  private mapMessage(
    dto: MessageDto,
    conversationIdFallback: string,
    contentFallback?: string,
  ): ChatMessage {
    const currentUser = this.authService.getCurrentUser();
    const senderId = this.getSenderId(dto.sender) ?? currentUser?.id ?? '';
    const conversationId = dto.conversation ?? conversationIdFallback;
    const content = dto.content || contentFallback || '';
    const createdAt = dto.created_at || new Date().toISOString();
    const updatedAt = dto.updated_at ?? createdAt;
    const isOutgoing = Boolean(currentUser?.id && senderId === currentUser.id);

    return {
      id: dto.id,
      conversationId,
      conversation: conversationId,
      sender: senderId,
      senderName: isOutgoing ? 'Du' : this.getSenderDisplayName(dto.sender),
      content,
      sentAt: new Date(createdAt),
      created_at: createdAt,
      updated_at: updatedAt,
      is_edited: dto.is_edited ?? false,
      direction: isOutgoing ? 'outgoing' : 'incoming',
    };
  }

  private getSenderId(sender: MessageDto['sender']): string | undefined {
    if (!sender) {
      return undefined;
    }

    return typeof sender === 'string' ? sender : sender.id;
  }

  private getSenderDisplayName(sender: MessageDto['sender']): string {
    if (!sender || typeof sender === 'string') {
      return 'Unbekannt';
    }

    return sender.display_name || sender.email || 'Unbekannt';
  }

  private extractList<T>(response: ListResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results;
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
