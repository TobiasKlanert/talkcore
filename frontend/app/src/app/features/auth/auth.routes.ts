import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest-guard';

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
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register-success-page/register-success-page').then((m) => m.RegisterSuccessPage),
  },
  {
    path: 'activate',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/activate-page/activate-page').then((m) => m.ActivatePage),
  },
];
