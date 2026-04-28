import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-reset-password-page',
  imports: [FormsModule, AuthFormLayout, RouterLink, MatButtonModule, MatInputModule, MatIconModule, MatFormFieldModule],
  templateUrl: './reset-password-page.html',
})
export class ResetPasswordPage {
  password = '';
  passwordConfirm = '';
  errorMessage = signal('');

  get passwordsMatch(): boolean {
    return this.password === this.passwordConfirm;
  }

  onSubmit(): void {}
}
