import { Routes } from '@angular/router';
import { AppShell } from '@core/layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    // canActivate: [authGuard],
    component: AppShell,
    children: [
      {
        path: 'chat',
        loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'chat',
      },
    ],
  },
];
