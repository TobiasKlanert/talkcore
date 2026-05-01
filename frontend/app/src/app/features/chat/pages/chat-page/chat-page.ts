import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const conversationId = params.get('conversationId');

      if (!conversationId) {
        this.navigateToConversation(this.conversationService.getLastConversationId());
        return;
      }

      const selectedConversation = this.conversationService.selectConversation(conversationId);

      if (selectedConversation.id !== conversationId) {
        this.navigateToConversation(selectedConversation.id);
      }

      this.scrollMessagesToBottom();
    });
  }

  protected updateDraftMessage(value: string): void {
    this.draftMessage.set(value);
  }

  protected sendMessage(): void {
    const selectedConversation = this.conversationService.selectedConversation();

    if (!selectedConversation) {
      return;
    }

    this.conversationService.sendMessage(selectedConversation.id, this.draftMessage());
    this.draftMessage.set('');
    this.scrollMessagesToBottom();
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

  private scrollMessagesToBottom(): void {
    window.setTimeout(() => {
      const messageList = this.messageList?.nativeElement;

      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    });
  }
}
