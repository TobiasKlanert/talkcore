import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/chat-page/chat-page').then((m) => m.ChatPage),
  },
  {
    path: ':conversationId',
    loadComponent: () => import('./pages/chat-page/chat-page').then((m) => m.ChatPage),
  },
];
