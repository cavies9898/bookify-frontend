import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { SessionStore } from '../../../core/auth/session.store';
import { SUPPRESS_ERROR_TOAST } from '../../../core/http/error.interceptor';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { LocationMap } from '../../../shared/components/location-map/location-map';
import { AvailabilityResponse, ServiceResponse, TimeSlot } from '../../../shared/models/service';
import {
  formatSlotTime,
  formatTimeOfDay,
  minutesToLabel,
  toIsoDate,
} from '../../../shared/utils/dates';
import { toApiRequestError } from '../../../shared/utils/errors';
import { BookingsService } from '../../bookings/bookings.service';
import { ServicesService } from '../services.service';

@Component({
  selector: 'app-service-detail',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    EmptyState,
    Loading,
    LocationMap,
  ],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetail {
  readonly id = input.required<string>();

  protected readonly environment = environment;
  private readonly servicesService = inject(ServicesService);
  private readonly bookingsService = inject(BookingsService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  @ViewChild(LocationMap) protected readonly map!: LocationMap;

  protected readonly service = signal<ServiceResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly selectedDate = signal<Date | null>(null);
  protected readonly availability = signal<AvailabilityResponse | null>(null);
  protected readonly availabilityLoading = signal(false);
  protected readonly availabilityError = signal<string | null>(null);

  protected readonly selectedSlot = signal<TimeSlot | null>(null);
  protected readonly booking = signal(false);
  protected readonly bookingError = signal<string | null>(null);
  protected readonly bookingSuccess = signal(false);

  protected readonly minDate = new Date();
  protected readonly formatted = { formatSlotTime, formatTimeOfDay, minutesToLabel };

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        void this.loadService(Number(id));
      }
    });
  }

  private async loadService(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.resetBooking();
    try {
      const service = await this.servicesService.getById(id);
      this.service.set(service);
      if (service.latitude != null && service.longitude != null) {
        setTimeout(() => this.map?.setCoordinates(service.latitude!, service.longitude!), 200);
      }
    } catch {
      this.error.set('No se pudo cargar el servicio solicitado.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onDateChange(date: Date | null): void {
    this.resetBooking();
    this.selectedDate.set(date);
    if (date) {
      void this.loadAvailability(date);
    } else {
      this.availability.set(null);
    }
  }

  private async loadAvailability(date: Date): Promise<void> {
    this.availabilityLoading.set(true);
    this.availabilityError.set(null);
    try {
      const service = this.service();
      if (!service) {
        return;
      }
      const availability = await this.servicesService.getAvailability(service.id, toIsoDate(date));
      this.availability.set(availability);
    } catch {
      this.availability.set(null);
      this.availabilityError.set('No se pudieron cargar los horarios disponibles.');
    } finally {
      this.availabilityLoading.set(false);
    }
  }

  protected selectSlot(slot: TimeSlot): void {
    if (!slot.available) {
      return;
    }
    this.bookingError.set(null);
    this.selectedSlot.set(slot);
  }

  protected isSlotSelected(slot: TimeSlot): boolean {
    return this.selectedSlot()?.startAt === slot.startAt;
  }

  protected async confirmBooking(): Promise<void> {
    const service = this.service();
    const slot = this.selectedSlot();
    if (!service || !slot) {
      return;
    }
    if (!this.session.isAuthenticated()) {
      await this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.booking.set(true);
    this.bookingError.set(null);
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);
    try {
      await this.bookingsService.create(
        { serviceId: service.id, startAt: slot.startAt, endAt: slot.endAt },
        context,
      );
      this.bookingSuccess.set(true);
    } catch (error) {
      this.bookingError.set(toApiRequestError(error).message);
    } finally {
      this.booking.set(false);
    }
  }

  protected retry(): void {
    void this.loadService(Number(this.id()));
  }

  private resetBooking(): void {
    this.selectedSlot.set(null);
    this.bookingError.set(null);
    this.bookingSuccess.set(false);
  }
}
