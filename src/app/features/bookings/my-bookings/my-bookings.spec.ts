import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';

import { BookingResponse } from '../../../shared/models/booking';
import { Page } from '../../../shared/models/page';
import { BookingsService } from '../bookings.service';
import { MyBookings } from './my-bookings';

@Component({ selector: 'app-fallback-stub', template: '' })
class FallbackStub {}

const booking: BookingResponse = {
  id: 1,
  status: 'CONFIRMED',
  startAt: '2030-06-10T10:00:00Z',
  endAt: '2030-06-10T11:00:00Z',
  createdAt: '2030-06-01T10:00:00Z',
  service: { id: 1, name: 'Consulta veterinaria', price: 50 },
  userName: 'Ana Pérez',
  userEmail: 'ana@example.com',
};

const page: Page<BookingResponse> = {
  content: [booking],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
  numberOfElements: 1,
  first: true,
  last: true,
  empty: false,
};

describe('MyBookings', () => {
  it('carga y muestra las reservas del usuario', async () => {
    const getPage = vi.fn().mockResolvedValue(page);

    TestBed.configureTestingModule({
      imports: [MyBookings],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        provideNativeDateAdapter(),
        { provide: BookingsService, useValue: { getPage, cancel: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(MyBookings);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mis reservas');
    expect(text).toContain('Consulta veterinaria');
    expect(text).toContain('Confirmada');
  });

  it('muestra un estado vacío cuando no hay reservas', async () => {
    const emptyPage: Page<BookingResponse> = {
      ...page,
      content: [],
      totalElements: 0,
      totalPages: 0,
      empty: true,
      last: true,
    };
    const getPage = vi.fn().mockResolvedValue(emptyPage);

    TestBed.configureTestingModule({
      imports: [MyBookings],
      providers: [
        provideRouter([{ path: '**', component: FallbackStub }]),
        provideLocationMocks(),
        provideNativeDateAdapter(),
        { provide: BookingsService, useValue: { getPage, cancel: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(MyBookings);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No hay reservas');
  });
});
