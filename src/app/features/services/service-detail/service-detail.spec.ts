import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';

import { ServiceResponse } from '../../../shared/models/service';
import { BookingsService } from '../../bookings/bookings.service';
import { ServicesService } from '../services.service';
import { ServiceDetail } from './service-detail';

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

describe('ServiceDetail', () => {
  it('carga y muestra la información del servicio', async () => {
    const getById = vi.fn().mockResolvedValue(service);

    TestBed.configureTestingModule({
      imports: [ServiceDetail],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        provideNativeDateAdapter(),
        { provide: ServicesService, useValue: { getById, getAvailability: vi.fn() } },
        { provide: BookingsService, useValue: { create: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(ServiceDetail);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Consulta veterinaria');
    expect(text).toContain('Reservar cita');
  });

  it('muestra el selector de fecha y los horarios al elegir día', async () => {
    const getById = vi.fn().mockResolvedValue(service);
    const getAvailability = vi.fn().mockResolvedValue({
      serviceId: 1,
      date: '2030-06-10',
      slots: [
        {
          startAt: new Date(2030, 5, 10, 9, 0).toISOString(),
          endAt: new Date(2030, 5, 10, 10, 0).toISOString(),
          available: true,
        },
        {
          startAt: new Date(2030, 5, 10, 10, 0).toISOString(),
          endAt: new Date(2030, 5, 10, 11, 0).toISOString(),
          available: false,
        },
      ],
    });

    TestBed.configureTestingModule({
      imports: [ServiceDetail],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        provideNativeDateAdapter(),
        { provide: ServicesService, useValue: { getById, getAvailability } },
        { provide: BookingsService, useValue: { create: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(ServiceDetail);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance as unknown as {
      onDateChange: (date: Date) => void;
    };
    instance.onDateChange(new Date(2030, 5, 10));
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(getAvailability).toHaveBeenCalledWith(1, '2030-06-10');
    expect(text).toContain('09:00');
  });
});
