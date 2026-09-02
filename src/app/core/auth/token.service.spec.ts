import { TestBed } from '@angular/core/testing';

import { testAuthResponse } from '../../testing/fixtures';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  it('almacena el access token y el usuario en sessionStorage y el refresh en localStorage', () => {
    service.saveTokens(testAuthResponse);

    expect(sessionStorage.getItem('bookify.access_token')).toBe('access-token-123');
    expect(sessionStorage.getItem('bookify.user')).toBe(JSON.stringify(testAuthResponse.user));
    expect(localStorage.getItem('bookify.refresh_token')).toBe('refresh-token-456');
  });

  it('expone accessToken, refreshToken y getUser', () => {
    service.saveTokens(testAuthResponse);

    expect(service.accessToken).toBe('access-token-123');
    expect(service.refreshToken).toBe('refresh-token-456');
    expect(service.getUser()).toEqual(testAuthResponse.user);
  });

  it('hasSession devuelve true si existe refresh token', () => {
    expect(service.hasSession()).toBe(false);
    service.saveTokens(testAuthResponse);
    expect(service.hasSession()).toBe(true);
  });

  it('clear elimina todos los tokens', () => {
    service.saveTokens(testAuthResponse);
    service.clear();

    expect(service.accessToken).toBeNull();
    expect(service.refreshToken).toBeNull();
    expect(service.getUser()).toBeNull();
  });
});
