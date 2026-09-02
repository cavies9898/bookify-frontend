import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Page } from '../../../shared/models/page';
import { ServiceResponse } from '../../../shared/models/service';
import { ServicesService } from '../../services/services.service';
import { ServicesAdmin } from './services-admin';

@Component({ selector: 'app-fallback-stub', template: '' })
class FallbackStub {}

const service: ServiceResponse = {
  id: 1,
  name: 'Consulta veterinaria',
  description: 'Consulta general de 60 minutos',
  durationMinutes: 60,
  capacity: 1,
  price: 50,
  openingTime: '09:00:00',
  closingTime: '18:00:00',
  active: true,
  createdAt: '2030-06-01T10:00:00Z',
};

const page: Page<ServiceResponse> = {
  content: [service],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
  numberOfElements: 1,
  first: true,
  last: true,
  empty: false,
};

describe('ServicesAdmin', () => {
  it('carga y muestra la tabla de servicios con acciones', async () => {
    const getPage = vi.fn().mockResolvedValue(page);

    TestBed.configureTestingModule({
      imports: [ServicesAdmin],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        {
          provide: ServicesService,
          useValue: { getPage, create: vi.fn(), update: vi.fn(), delete: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(ServicesAdmin);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Gestión de servicios');
    expect(text).toContain('Consulta veterinaria');
    expect(text).toContain('Activo');
    expect(text).toContain('Nuevo servicio');
    expect(text).toContain('Editar');
    expect(text).toContain('Eliminar');
  });
});
