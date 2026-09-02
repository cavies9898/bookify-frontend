import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { testUser } from '../../../testing/fixtures';
import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  const createFixture = (): {
    fixture: ReturnType<typeof TestBed.createComponent<Header>>;
  } => {
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideLocationMocks()],
    });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    return { fixture };
  };

  it('muestra Iniciar sesión y Registrarse sin sesión', () => {
    const { fixture } = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Iniciar sesión');
    expect(text).toContain('Registrarse');
  });

  it('muestra el nombre, el rol y el botón Salir con sesión', () => {
    sessionStorage.setItem('bookify.user', JSON.stringify(testUser));
    sessionStorage.setItem('bookify.access_token', 'token');
    localStorage.setItem('bookify.refresh_token', 'refresh');

    const { fixture } = createFixture();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('Cliente');
    expect(text).toContain('Salir');
  });
});
