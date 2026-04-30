import { Routes } from '@angular/router';
import { authFlowGuard } from '@core/guards/auth-flow-guard';
import { guestGuard } from '@core/guards/guest-guard';
import { mailLinkGuard } from '@core/guards/mail-link-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'register-success',
    canActivate: [guestGuard, authFlowGuard],
    loadComponent: () =>
      import('./pages/register-success-page/register-success-page').then(
        (m) => m.RegisterSuccessPage,
      ),
  },
  {
    path: 'activate',
    canActivate: [guestGuard, mailLinkGuard],
    loadComponent: () => import('./pages/activate-page/activate-page').then((m) => m.ActivatePage),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard, authFlowGuard],
    loadComponent: () =>
      import('./pages/forgot-password-page/forgot-password-page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'forgot-password-success',
    canActivate: [guestGuard, authFlowGuard],
    loadComponent: () =>
      import('./pages/forgot-password-success-page/forgot-password-success-page').then(
        (m) => m.ForgotPasswordSuccessPage,
      ),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard, mailLinkGuard],
    loadComponent: () =>
      import('./pages/reset-password-page/reset-password-page').then((m) => m.ResetPasswordPage),
  },
];
