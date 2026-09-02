import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

import { User } from '../../shared/models/auth';
import { authGuard, guestGuard, roleGuard } from './guards';

@Component({ selector: 'app-home-stub', template: 'home' })
class HomeStub {}

@Component({ selector: 'app-login-stub', template: 'login' })
class LoginStub {}

@Component({ selector: 'app-admin-stub', template: 'admin' })
class AdminStub {}

const CLIENTE: User = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'CLIENTE' };
const ADMIN: User = { id: 2, name: 'Root', email: 'root@test.com', role: 'ADMIN' };

describe('Guards funcionales', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: HomeStub, canActivate: [authGuard] },
          { path: 'login', component: LoginStub, canActivate: [guestGuard] },
          { path: 'admin', component: AdminStub, canActivate: [authGuard, roleGuard('ADMIN')] },
        ]),
        provideLocationMocks(),
      ],
    });
  });

  const setSession = (user: User): void => {
    sessionStorage.setItem('bookify.user', JSON.stringify(user));
    sessionStorage.setItem('bookify.access_token', 'token');
    localStorage.setItem('bookify.refresh_token', 'refresh');
  };

  const navigate = async (url: string): Promise<void> => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
  };

  it('authGuard redirige a /login con returnUrl si no hay sesión', async () => {
    await navigate('/');
    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2F');
  });

  it('authGuard permite el acceso si hay sesión', async () => {
    setSession(CLIENTE);
    await navigate('/');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('guestGuard redirige al home si ya hay sesión', async () => {
    setSession(CLIENTE);
    await navigate('/login');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('guestGuard permite ver /login sin sesión', async () => {
    await navigate('/login');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('roleGuard(ADMIN) bloquea a un CLIENTE y redirige al home', async () => {
    setSession(CLIENTE);
    await navigate('/admin');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('roleGuard(ADMIN) permite el acceso a un ADMIN', async () => {
    setSession(ADMIN);
    await navigate('/admin');
    expect(TestBed.inject(Router).url).toBe('/admin');
  });
});
