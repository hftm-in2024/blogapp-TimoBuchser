import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserInfo = {
  preferred_username: string;
  email: string;
  name: string;
  roles: string[];
};

type SessionResponse = {
  isAuthenticated: boolean;
  user: UserInfo | null;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(false);
  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);
  readonly roles = computed(() => this.user()?.roles ?? []);
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.checkSession();
  }

  async checkSession(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<SessionResponse>(`${environment.bffUrl}/auth/me`, {
          credentials: 'include',
        }),
      );
      this.isAuthenticated.set(response.isAuthenticated);
      this.user.set(response.user);
    } catch {
      this.isAuthenticated.set(false);
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.bffUrl}/auth/logout`, null, {
          credentials: 'include',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        }),
      );
    } catch (error) {
      console.error('Logout konnte nicht abgeschlossen werden', error);
    } finally {
      this.isAuthenticated.set(false);
      this.user.set(null);
      window.location.href = environment.logoutUrl;
    }
  }
}
