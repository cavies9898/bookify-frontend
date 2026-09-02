import { HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../shared/models/auth';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);

  readonly user = signal<User | null>(this.tokenService.getUser());
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly isClient = computed(() => this.user()?.role === 'CLIENTE');

  constructor() {
    // Restaura la sesión en pestañas nuevas: existe refresh token pero el
    // access token (sessionStorage, ligado a la pestaña) se ha perdido.
    // Se difiere para no disparar una petición HTTP a mitad de la inyección.
    if (!this.tokenService.getUser() && this.tokenService.hasSession()) {
      setTimeout(() => {
        void this.refresh().catch(() => this.logout());
      }, 0);
    }
  }

  async login(credentials: LoginRequest, context?: HttpContext): Promise<void> {
    const auth = await this.authService.login(credentials, context);
    this.applyAuth(auth);
  }

  async register(payload: RegisterRequest, context?: HttpContext): Promise<void> {
    const auth = await this.authService.register(payload, context);
    this.applyAuth(auth);
  }

  async refresh(): Promise<AuthResponse> {
    const refreshToken = this.tokenService.refreshToken;
    if (!refreshToken) {
      throw new Error('No hay sesión activa.');
    }
    const auth = await this.authService.refresh(refreshToken);
    this.applyAuth(auth);
    return auth;
  }

  logout(): void {
    this.tokenService.clear();
    this.user.set(null);
  }

  private applyAuth(auth: AuthResponse): void {
    this.tokenService.saveTokens(auth);
    this.user.set(auth.user);
  }
}
