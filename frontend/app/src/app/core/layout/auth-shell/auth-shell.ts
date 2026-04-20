import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
})
export class AuthShell {
  protected readonly themeService = inject(ThemeService);
}
