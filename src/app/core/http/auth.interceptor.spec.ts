import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { testAuthResponse, testUser } from '../../testing/fixtures';
import { authInterceptor } from './auth.interceptor';

@Component({
  selector: 'app-login-stub',
  template: '',
})
class LoginStub {}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('authInterceptor', () => {
  let httpTesting: HttpTestingController;
  const snackBar = { open: vi.fn() };

  const setSession = (): void => {
    sessionStorage.setItem('bookify.access_token', 'access-token-123');
    sessionStorage.setItem('bookify.user', JSON.stringify(testUser));
    localStorage.setItem('bookify.refresh_token', 'refresh-token-456');
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    snackBar.open.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: LoginStub }]),
        provideLocationMocks(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('añade la cabecera Authorization cuando hay sesión', () => {
    setSession();

    const http = TestBed.inject(HttpClient);
    http.get('/api/services').subscribe();

    const req = httpTesting.expectOne('/api/services');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token-123');
    req.flush({ content: [] });
  });

  it('no añade la cabecera en los endpoints públicos de auth', () => {
    setSession();

    const http = TestBed.inject(HttpClient);
    http.post('/api/auth/login', { email: 'a@b.c', password: 'x' }).subscribe();

    const req = httpTesting.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(testAuthResponse);
  });

  it('al recibir 401 renueva el token y reintenta la petición original', async () => {
    setSession();

    const http = TestBed.inject(HttpClient);
    const page = { content: [{ id: 1, name: 'Servicio' }] };
    let result: unknown;
    http.get('/api/services').subscribe((value) => {
      result = value;
    });

    const first = httpTesting.expectOne('/api/services');
    first.flush({ message: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-token-456' });
    refreshReq.flush({
      ...testAuthResponse,
      accessToken: 'access-token-renovado',
      refreshToken: 'refresh-token-rotado',
    });

    await flushMicrotasks();

    const retried = httpTesting.expectOne('/api/services');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer access-token-renovado');
    retried.flush(page);

    expect(result).toEqual(page);
    expect(localStorage.getItem('bookify.refresh_token')).toBe('refresh-token-rotado');
  });

  it('al fallar el refresh cierra la sesión y redirige a /login', async () => {
    setSession();

    const http = TestBed.inject(HttpClient);
    http.get('/api/services').subscribe({ error: () => undefined });

    const first = httpTesting.expectOne('/api/services');
    first.flush({ message: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`);
    refreshReq.flush({ message: 'refresh inválido' }, { status: 401, statusText: 'Unauthorized' });

    await flushMicrotasks();
    await flushMicrotasks();

    expect(sessionStorage.getItem('bookify.access_token')).toBeNull();
    expect(localStorage.getItem('bookify.refresh_token')).toBeNull();
    expect(snackBar.open).toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
