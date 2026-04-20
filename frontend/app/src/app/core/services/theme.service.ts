import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly _theme = signal<ThemeMode>('light');

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.initTheme();

    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.toggle('dark-theme', theme === 'dark');
      localStorage.setItem(this.storageKey, theme);
    });
  }

  toggleTheme(): void {
    this._theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: ThemeMode): void {
    this._theme.set(theme);
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey) as ThemeMode | null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this._theme.set(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._theme.set(prefersDark ? 'dark' : 'light');
  }
}
