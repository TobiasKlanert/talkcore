import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConversationService } from '@core/services/conversation.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  imports: [
    FormsModule,
    TextFieldModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
  ],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPage {
  @ViewChild('messageList') private readonly messageList?: ElementRef<HTMLElement>;

  protected readonly conversationService = inject(ConversationService);
  protected readonly draftMessage = signal('');
  protected readonly loadingConversations = signal(false);
  protected readonly loadingMessages = signal(false);
  protected readonly sendingMessage = signal(false);
  protected readonly errorMessage = signal('');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadConversations();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const conversationId = params.get('conversationId');

      if (!conversationId) {
        const lastConversationId = this.conversationService.getLastConversationId();

        if (lastConversationId) {
          this.navigateToConversation(lastConversationId);
        }

        return;
      }

      this.selectConversation(conversationId);
    });
  }

  protected updateDraftMessage(value: string): void {
    this.draftMessage.set(value);
  }

  protected sendMessage(): void {
    const selectedConversation = this.conversationService.selectedConversation();
    const content = this.draftMessage().trim();

    if (!selectedConversation || !content || this.sendingMessage()) {
      return;
    }

    this.sendingMessage.set(true);
    this.errorMessage.set('');

    this.conversationService
      .sendMessage(selectedConversation.id, content)
      .pipe(
        finalize(() => {
          this.sendingMessage.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (message) => {
          if (message) {
            this.draftMessage.set('');
            this.scrollMessagesToBottom();
          }
        },
        error: () => {
          this.errorMessage.set('Nachricht konnte nicht gesendet werden.');
        },
      });
  }

  protected formatMessageTime(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private navigateToConversation(conversationId: string): void {
    void this.router.navigate(['/chat', conversationId], { replaceUrl: true });
  }

  private loadConversations(): void {
    this.loadingConversations.set(true);
    this.errorMessage.set('');

    this.conversationService
      .loadConversations()
      .pipe(
        finalize(() => {
          this.loadingConversations.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const routeConversationId = this.route.snapshot.paramMap.get('conversationId');

          if (routeConversationId) {
            this.selectConversation(routeConversationId);
            return;
          }

          const lastConversationId = this.conversationService.getLastConversationId();
          const fallbackConversation =
            (lastConversationId && this.conversationService.getConversation(lastConversationId)) ||
            this.conversationService.selectFirstConversation();

          if (fallbackConversation) {
            this.navigateToConversation(fallbackConversation.id);
          }
        },
        error: () => {
          this.errorMessage.set('Conversations konnten nicht geladen werden.');
        },
      });
  }

  private selectConversation(conversationId: string): void {
    const selectedConversation = this.conversationService.selectConversation(conversationId);

    if (!selectedConversation && this.conversationService.conversations().length > 0) {
      const fallbackConversation = this.conversationService.selectFirstConversation();

      if (fallbackConversation) {
        this.navigateToConversation(fallbackConversation.id);
      }

      return;
    }

    this.loadMessages(conversationId);
  }

  private loadMessages(conversationId: string): void {
    this.loadingMessages.set(true);
    this.errorMessage.set('');

    this.conversationService
      .loadMessages(conversationId)
      .pipe(
        finalize(() => {
          this.loadingMessages.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.scrollMessagesToBottom();
        },
        error: () => {
          this.errorMessage.set('Nachrichten konnten nicht geladen werden.');
        },
      });
  }

  private scrollMessagesToBottom(): void {
    window.setTimeout(() => {
      const messageList = this.messageList?.nativeElement;

      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    });
  }
}
