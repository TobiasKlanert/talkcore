import { Routes } from '@angular/router';
import { AppShell } from '@core/layout/app-shell/app-shell';
import { AuthShell } from '@core/layout/auth-shell/auth-shell';
import { authGuard } from '@core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthShell,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AppShell,
    children: [
      {
        path: 'chat',
        loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
      },
    ],
  },
];
