import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { ConversationService } from '@core/services/conversation.service';

type Theme = 'light' | 'dark';
type ConversationGroup = 'channel' | 'dm';
type ExpandedConversationGroups = Record<ConversationGroup, boolean>;

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  protected readonly themeService = inject(ThemeService);
  protected readonly conversationService = inject(ConversationService);
  protected readonly sidenavExpanded = signal(false);
  protected readonly expandedConversationGroups = signal<ExpandedConversationGroups>({
    channel: false,
    dm: false,
  });
  protected readonly activeConversationGroup = computed<ConversationGroup | null>(
    () => this.conversationService.selectedConversation()?.type ?? null,
  );
  private readonly authService = inject(AuthService);

  constructor(private router: Router) {}

  menuSections = [
    {
      items: [
        { label: 'Profil', icon: 'account_circle', action: 'openProfile' },
        { label: 'Einstellungen', icon: 'settings', action: 'openSettings' },
      ],
    },
    {
      divider: true,
      items: [{ label: 'Über TalkCore', icon: 'info', action: 'openInfo' }],
    },
    {
      divider: true,
      items: [{ label: 'Logout', icon: 'logout', action: 'logout' }],
    },
  ];

  toggleSidenav(): void {
    this.sidenavExpanded.update((expanded) => {
      const nextExpanded = !expanded;

      this.expandedConversationGroups.set(this.getExpandedGroupsForSidenavState(nextExpanded));

      return nextExpanded;
    });
  }

  protected onConversationPanelOpened(group: ConversationGroup): void {
    if (this.sidenavExpanded()) {
      this.expandedConversationGroups.update((groups) => ({ ...groups, [group]: true }));
    }
  }

  protected onConversationPanelClosed(group: ConversationGroup): void {
    if (this.sidenavExpanded()) {
      this.expandedConversationGroups.update((groups) => ({ ...groups, [group]: false }));
    }
  }

  protected openConversationGroupFromCollapsedSidenav(group: ConversationGroup): void {
    if (this.sidenavExpanded()) {
      return;
    }

    this.sidenavExpanded.set(true);
    this.expandedConversationGroups.set({
      channel: group === 'channel',
      dm: group === 'dm',
    });
  }

  private getExpandedGroupsForSidenavState(expanded: boolean): ExpandedConversationGroups {
    const activeGroup = this.activeConversationGroup();

    return {
      channel: expanded && activeGroup === 'channel',
      dm: expanded && activeGroup === 'dm',
    };
  }

  onMenuClick(item: any): void {
    switch (item.action) {
      case 'openProfile':
        // this.openProfile();
        break;
      case 'openSettings':
        // this.openSettings();
        break;
      case 'openInfo':
        // this.openInfo();
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearLocalData();
        this.router.navigate(['/login']);
      },
      error: () => {
        // fallback: trotzdem lokal logouten
        this.authService.clearLocalData();
        this.router.navigate(['/login']);
      },
    });
  }
}
