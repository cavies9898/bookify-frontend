import { Injectable } from '@angular/core';

import { AuthResponse, User } from '../../shared/models/auth';

/**
 * Almacenamiento de la sesión:
 * - accessToken y user van a sessionStorage: tokens de corta vida, ligados a la
 *   pestaña actual; se limpian al cerrarla y reducen la ventana de exposición.
 * - refreshToken va a localStorage: vida de 7 días y se reutiliza al recargar
 *   la página o reabrir el navegador para renovar la sesión.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'bookify.access_token';
  private readonly REFRESH_TOKEN_KEY = 'bookify.refresh_token';
  private readonly USER_KEY = 'bookify.user';

  get accessToken(): string | null {
    return this.storage('session').getItem(this.ACCESS_TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return this.storage('local').getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const raw = this.storage('session').getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  hasSession(): boolean {
    return this.refreshToken !== null;
  }

  saveTokens(auth: AuthResponse): void {
    this.storage('session').setItem(this.ACCESS_TOKEN_KEY, auth.accessToken);
    this.storage('session').setItem(this.USER_KEY, JSON.stringify(auth.user));
    this.storage('local').setItem(this.REFRESH_TOKEN_KEY, auth.refreshToken);
  }

  clear(): void {
    this.storage('session').removeItem(this.ACCESS_TOKEN_KEY);
    this.storage('session').removeItem(this.USER_KEY);
    this.storage('local').removeItem(this.REFRESH_TOKEN_KEY);
  }

  private storage(kind: 'session' | 'local'): Storage {
    return kind === 'session' ? sessionStorage : localStorage;
  }
}
