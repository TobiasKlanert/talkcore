import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
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
    this.sidenavExpanded.update((expanded) => !expanded);
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
