import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';

import { SessionStore } from '../../../core/auth/session.store';
import { Login } from './login';

@Component({ selector: 'app-fallback-stub', template: '' })
class FallbackStub {}

describe('Login', () => {
  it('valida el formulario y llama a session.login con las credenciales', async () => {
    const loginSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: SessionStore, useValue: { login: loginSpy } },
      ],
    });

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    const instance = fixture.componentInstance as unknown as {
      form: {
        controls: {
          email: { setValue: (v: string) => void };
          password: { setValue: (v: string) => void };
        };
      };
    };
    instance.form.controls.email.setValue('ana@example.com');
    instance.form.controls.password.setValue('password123');
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy.mock.calls[0][0]).toEqual({
      email: 'ana@example.com',
      password: 'password123',
    });
  });

  it('muestra errores de validación al enviar campos vacíos', () => {
    const loginSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: SessionStore, useValue: { login: loginSpy } },
      ],
    });

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('El email es obligatorio');
    expect(text).toContain('La contraseña es obligatoria');
    expect(loginSpy).not.toHaveBeenCalled();
  });
});
