import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Page } from '../../../shared/models/page';
import { ServiceResponse } from '../../../shared/models/service';
import { Catalog } from './catalog';
import { ServicesService } from '../services.service';

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

describe('Catalog', () => {
  it('carga y renderiza los servicios del catálogo', async () => {
    const getPage = vi.fn().mockResolvedValue(page);

    TestBed.configureTestingModule({
      imports: [Catalog],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: ServicesService, useValue: { getPage } },
      ],
    });

    const fixture = TestBed.createComponent(Catalog);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Consulta veterinaria');
    expect(text).toContain('50,00');
    expect(text).toContain('Reservar');
  });

  it('muestra el estado vacío cuando no hay servicios', async () => {
    const emptyPage: Page<ServiceResponse> = {
      ...page,
      content: [],
      totalElements: 0,
      totalPages: 0,
      empty: true,
      last: true,
    };
    const getPage = vi.fn().mockResolvedValue(emptyPage);

    TestBed.configureTestingModule({
      imports: [Catalog],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        { provide: ServicesService, useValue: { getPage } },
      ],
    });

    const fixture = TestBed.createComponent(Catalog);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No hay servicios disponibles');
  });
});
