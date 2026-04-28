import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-reset-password-page',
  imports: [
    FormsModule,
    AuthFormLayout,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.scss',
})
export class ResetPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly uid = this.normalizeResetParam(this.route.snapshot.queryParamMap.get('uid'));
  private readonly token = this.normalizeResetParam(this.route.snapshot.queryParamMap.get('token'));

  password = '';
  passwordConfirm = '';
  errorMessage = signal('');
  successMessage = signal('');
  isSubmitting = signal(false);

  get passwordsMatch(): boolean {
    return this.password === this.passwordConfirm;
  }

  get hasResetLink(): boolean {
    return Boolean(this.uid && this.token);
  }

  constructor() {
    if (!this.hasResetLink) {
      this.errorMessage.set(
        'Der Link zum Zurücksetzen ist unvollständig. Bitte fordere einen neuen Link an.',
      );
    }
  }

  onSubmit(resetPasswordForm: NgForm): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.hasResetLink) {
      this.errorMessage.set(
        'Der Link zum Zurücksetzen ist unvollständig. Bitte fordere einen neuen Link an.',
      );
      return;
    }

    if (!this.passwordsMatch) {
      this.errorMessage.set('Die Passwörter stimmen nicht überein.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .confirmPasswordReset({
        uid: this.uid,
        token: this.token,
        password: this.password,
        password_confirm: this.passwordConfirm,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          resetPasswordForm.resetForm({
            password: '',
            passwordConfirm: '',
          });
          this.successMessage.set('Dein Passwort wurde erfolgreich zurückgesetzt.');
        },
        error: () => {
          this.errorMessage.set(
            'Das Passwort konnte nicht zurückgesetzt werden. Bitte prüfe den Link oder fordere einen neuen an.',
          );
        },
      });
  }

  private normalizeResetParam(value: string | null): string {
    const normalized = (value ?? '').replace(/\s+/g, '').replace(/=3D/gi, '=');

    if (normalized.startsWith('3D')) {
      return normalized.slice(2);
    }

    return normalized;
  }
}
