import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { testAuthResponse } from '../../testing/fixtures';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch()), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('login envía las credenciales a POST /auth/login', async () => {
    const credentials = { email: 'ana@example.com', password: 'password123' };
    const promise = service.login(credentials);

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    expect(req.request.context).toBeDefined();
    req.flush(testAuthResponse);

    await expect(promise).resolves.toEqual(testAuthResponse);
  });

  it('register envía los datos a POST /auth/register', async () => {
    const payload = { name: 'Ana Pérez', email: 'ana@example.com', password: 'password123' };
    const promise = service.register(payload);

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(testAuthResponse);

    await expect(promise).resolves.toEqual(testAuthResponse);
  });

  it('refresh envía el refresh token a POST /auth/refresh', async () => {
    const promise = service.refresh('refresh-token-456');

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token-456' });
    req.flush(testAuthResponse);

    await expect(promise).resolves.toEqual(testAuthResponse);
  });
});
