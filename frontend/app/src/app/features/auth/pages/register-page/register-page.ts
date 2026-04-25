import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-register-page',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AuthFormLayout,
  ],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);

  username = '';
  email = '';
  password = '';
  passwordConfirm = '';
  errorMessage = signal('');
  successMessage = signal('');

  get passwordsMatch(): boolean {
    return this.password === this.passwordConfirm;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.passwordsMatch) {
      this.errorMessage.set('Die Passwörter stimmen nicht überein.');
      return;
    }

    this.authService
      .register({
        display_name: this.username,
        email: this.email,
        password: this.password,
        password_confirm: this.passwordConfirm,
      })
      .subscribe({
        next: (response) => {
          this.successMessage.set(
            response.detail || 'Registrierung erfolgreich. Bitte prüfe dein E-Mail-Postfach.',
          );
        },
        error: () => {
          this.errorMessage.set('Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben.');
        },
      });
  }
}
