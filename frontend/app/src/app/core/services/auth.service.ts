import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';

import { LoginRequest, LoginResponse, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, payload).pipe(
      tap((response) => {
        this.setSession(response);
      }),
    );
  }

  logout(): Observable<void> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.clearLocalData();
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/logout/`, {
      refresh: refreshToken,
    });
  }

  clearLocalData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const rawUser = localStorage.getItem(this.USER_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }
}
