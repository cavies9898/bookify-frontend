import {
  HttpClient,
  HttpContext,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiRequestError } from '../../shared/utils/errors';
import { errorInterceptor, SUPPRESS_ERROR_TOAST } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpTesting: HttpTestingController;
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    snackBar.open.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor]), withFetch()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('normaliza el ApiError del backend y lanza ApiRequestError', async () => {
    const http = TestBed.inject(HttpClient);
    const promise = http.get('/api/services').toPromise();

    const req = httpTesting.expectOne('/api/services');
    req.flush(
      {
        timestamp: '2030-06-10T10:00:00Z',
        status: 409,
        error: 'Conflict',
        message: 'El horario solicitado se solapa con una reserva existente',
        path: '/api/bookings',
      },
      { status: 409, statusText: 'Conflict' },
    );

    await expect(promise).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 409,
      message: 'El horario solicitado se solapa con una reserva existente',
    });
    expect(snackBar.open).toHaveBeenCalledWith(
      'El horario solicitado se solapa con una reserva existente',
      'Cerrar',
      { duration: 5000 },
    );
  });

  it('usa un mensaje genérico en español cuando no hay ApiError', async () => {
    const http = TestBed.inject(HttpClient);
    const promise = http.get('/api/services').toPromise();

    const req = httpTesting.expectOne('/api/services');
    req.flush('boom', { status: 500, statusText: 'Error' });

    await expect(promise).rejects.toMatchObject({
      status: 500,
      message: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
    });
  });

  it('no muestra toast si la petición lleva SUPPRESS_ERROR_TOAST', async () => {
    const http = TestBed.inject(HttpClient);
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);
    const promise = http.get('/api/services', { context }).toPromise();

    const req = httpTesting.expectOne('/api/services');
    req.flush(
      {
        status: 429,
        error: 'Too Many Requests',
        message: 'Demasiados intentos',
        path: '/api/auth/login',
      },
      { status: 429, statusText: 'Too Many Requests' },
    );

    await expect(promise).rejects.toBeInstanceOf(ApiRequestError);
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('no muestra toast en errores 401 (los gestiona el interceptor de auth)', async () => {
    const http = TestBed.inject(HttpClient);
    const promise = http.get('/api/services').toPromise();

    const req = httpTesting.expectOne('/api/services');
    req.flush(
      { status: 401, error: 'Unauthorized', message: 'Token expirado', path: '/api/services' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    await expect(promise).rejects.toMatchObject({ status: 401 });
    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
