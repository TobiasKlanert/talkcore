import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-activate-page',
  imports: [AuthFormLayout, RouterLink, MatButtonModule],
  templateUrl: './activate-page.html',
  styleUrl: './activate-page.scss'
})
export class ActivatePage {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly uid = this.normalizeActivationParam(this.route.snapshot.queryParamMap.get('uid'));
  private readonly token = this.normalizeActivationParam(
    this.route.snapshot.queryParamMap.get('token'),
  );

  errorMessage = signal('');
  successMessage = signal('');
  isActivating = signal(false);

  get hasActivationLink(): boolean {
    return Boolean(this.uid && this.token);
  }

  constructor() {
    if (!this.hasActivationLink) {
      this.errorMessage.set(
        'Der Aktivierungslink ist unvollständig. Bitte nutze den Link aus deiner E-Mail.',
      );
      return;
    }

    this.activateAccount();
  }

  private activateAccount(): void {
    this.isActivating.set(true);

    this.authService
      .activateAccount({
        uid: this.uid,
        token: this.token,
      })
      .pipe(finalize(() => this.isActivating.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Dein Konto wurde erfolgreich aktiviert.');
        },
        error: () => {
          this.errorMessage.set(
            'Dein Konto konnte nicht aktiviert werden. Der Link ist ungültig oder abgelaufen.',
          );
        },
      });
  }

  private normalizeActivationParam(value: string | null): string {
    const normalized = (value ?? '').replace(/\s+/g, '').replace(/=3D/gi, '=');

    if (normalized.startsWith('3D')) {
      return normalized.slice(2);
    }

    return normalized;
  }
}
