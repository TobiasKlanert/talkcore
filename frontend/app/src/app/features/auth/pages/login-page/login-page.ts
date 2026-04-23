import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly rememberedEmailKey = 'remembered_login_email';
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  rememberEmail = false;

  constructor() {
    const rememberedEmail = localStorage.getItem(this.rememberedEmailKey);

    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberEmail = true;
    }
  }

  onEmailChange(value: string): void {
    this.email = value;

    if (this.rememberEmail) {
      localStorage.setItem(this.rememberedEmailKey, value);
    }
  }

  onRememberEmailChange(): void {
    if (this.rememberEmail) {
      localStorage.setItem(this.rememberedEmailKey, this.email);
      return;
    }

    localStorage.removeItem(this.rememberedEmailKey);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.rememberEmail) {
      localStorage.setItem(this.rememberedEmailKey, this.email);
    } else {
      localStorage.removeItem(this.rememberedEmailKey);
    }

    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/chat']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.detail || 'Login fehlgeschlagen.';
        },
      });
  }
}
