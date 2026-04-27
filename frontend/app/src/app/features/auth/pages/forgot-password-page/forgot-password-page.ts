import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AuthFormLayout,
  ],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  errorMessage = signal('');

  onSubmit(): void {
    this.errorMessage.set('');

    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.router.navigate(['/forgot-password-success']);
      },
      error: () => {
        this.errorMessage.set(
          'Die Anfrage konnte nicht verarbeitet werden. Bitte versuche es später erneut.',
        );
      },
    });
  }
}
