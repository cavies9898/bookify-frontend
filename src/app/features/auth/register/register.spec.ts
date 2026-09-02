import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SessionStore } from '../../../core/auth/session.store';
import { Register } from './register';

@Component({ selector: 'app-fallback-stub', template: '' })
class FallbackStub {}

describe('Register', () => {
  it('envía name, email y password al formulario', async () => {
    const registerSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: SessionStore, useValue: { register: registerSpy } },
      ],
    });

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    const instance = fixture.componentInstance as unknown as {
      form: {
        controls: {
          name: { setValue: (v: string) => void };
          email: { setValue: (v: string) => void };
          password: { setValue: (v: string) => void };
        };
      };
    };
    instance.form.controls.name.setValue('  Ana  ');
    instance.form.controls.email.setValue('ana@example.com');
    instance.form.controls.password.setValue('password123');
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(registerSpy).toHaveBeenCalledTimes(1);
    expect(registerSpy.mock.calls[0][0]).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'password123',
    });
  });

  it('muestra errores de validación al enviar campos vacíos', () => {
    const registerSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: SessionStore, useValue: { register: registerSpy } },
      ],
    });

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('El nombre es obligatorio');
    expect(text).toContain('El email es obligatorio');
    expect(text).toContain('La contraseña es obligatoria');
    expect(registerSpy).not.toHaveBeenCalled();
  });
});
