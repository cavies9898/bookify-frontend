import { TestBed } from '@angular/core/testing';

import { testAuthResponse } from '../../testing/fixtures';
import { AuthService } from './auth.service';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  let store: SessionStore;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    authService = {
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
    store = TestBed.inject(SessionStore);
  });

  it('login guarda el usuario y marca la sesión como autenticada', async () => {
    authService.login.mockResolvedValue(testAuthResponse);

    await store.login({ email: 'ana@example.com', password: 'password123' });

    expect(store.user()).toEqual(testAuthResponse.user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isClient()).toBe(true);
    expect(store.isAdmin()).toBe(false);
  });

  it('register crea la sesión con el usuario devuelto', async () => {
    authService.register.mockResolvedValue(testAuthResponse);

    await store.register({ name: 'Ana Pérez', email: 'ana@example.com', password: 'password123' });

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()?.email).toBe('ana@example.com');
  });

  it('refresh renueva tokens y actualiza el usuario', async () => {
    authService.login.mockResolvedValue(testAuthResponse);
    await store.login({ email: 'ana@example.com', password: 'password123' });

    const rotated = {
      ...testAuthResponse,
      accessToken: 'nuevo-access',
      refreshToken: 'nuevo-refresh',
      user: { ...testAuthResponse.user, name: 'Ana Rotada' },
    };
    authService.refresh.mockResolvedValue(rotated);

    await store.refresh();

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token-456');
    expect(store.user()?.name).toBe('Ana Rotada');
    expect(localStorage.getItem('bookify.refresh_token')).toBe('nuevo-refresh');
  });

  it('logout limpia el estado y el almacenamiento', async () => {
    authService.login.mockResolvedValue(testAuthResponse);
    await store.login({ email: 'ana@example.com', password: 'password123' });

    store.logout();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.user()).toBeNull();
    expect(localStorage.getItem('bookify.refresh_token')).toBeNull();
    expect(sessionStorage.getItem('bookify.access_token')).toBeNull();
  });
});
