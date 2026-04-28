import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFormLayout } from '../../components/auth-form-layout/auth-form-layout';

@Component({
  selector: 'app-forgot-password-success-page',
  imports: [AuthFormLayout, RouterLink],
  templateUrl: './forgot-password-success-page.html',
  styleUrl: './forgot-password-success-page.scss',
})
export class ForgotPasswordSuccessPage {
  email = history.state.email ?? '';
}
