import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

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
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell implements OnInit {
  protected readonly sidenavExpanded = signal(false);

  private currentTheme: Theme = 'light';
  isDark: boolean | null = null;

  menuSections = [
    {
      items: [
        { label: 'Profil', icon: 'account_circle' },
        { label: 'Einstellungen', icon: 'settings' },
      ],
    },
    {
      divider: true,
      items: [{ label: 'Über TalkCore', icon: 'info' }],
    },
    {
      divider: true,
      items: [{ label: 'Logout', icon: 'logout' }],
    },
  ];

  navSections = [
    {
      items: [
        { label: 'Channels', icon: 'tag', route: '/chat' },
        { label: 'DMs', icon: 'chat', route: '/dms' },
        { label: 'Neuer Chat', icon: 'edit_square', route: '/new-chat' },
      ],
    },
    {
      divider: true,
      items: [
        { label: 'Impressum', icon: 'description', route: '/imprint' },
        { label: 'Datenschutz', icon: 'policy', route: '/privacy' },
      ],
    },
  ];

  ngOnInit(): void {
    this.initTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
  }

  toggleSidenav(): void {
    this.sidenavExpanded.update((expanded) => !expanded);
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }

    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;

    if (theme === 'dark') {
      body.classList.add('dark-theme');
      this.isDark = true;
    } else {
      body.classList.remove('dark-theme');
      this.isDark = false;
    }
  }
}
