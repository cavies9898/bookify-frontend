import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../../environments/environment';
import { BookingResponse, BookingStatus } from '../../../shared/models/booking';
import { Page } from '../../../shared/models/page';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { openConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { toIsoDate } from '../../../shared/utils/dates';
import { BookingsService, BookingPageQuery } from '../bookings.service';

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

@Component({
  selector: 'app-booking-table',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    EmptyState,
    Loading,
    Paginator,
    StatusBadge,
  ],
  templateUrl: './booking-table.html',
  styleUrl: './booking-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingTable implements OnInit {
  readonly showClient = input<boolean>(false);

  protected readonly environment = environment;
  private readonly bookingsService = inject(BookingsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly page = signal<Page<BookingResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly status = signal<BookingStatus | ''>('');
  protected readonly from = signal<Date | null>(null);
  protected readonly to = signal<Date | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const pageNumber = this.page()?.number ?? 0;
      const query: BookingPageQuery = { page: pageNumber, size: 20 };
      const status = this.status();
      if (status) {
        query.status = status;
      }
      if (this.from()) {
        query.from = toIsoDate(this.from()!);
      }
      if (this.to()) {
        query.to = toIsoDate(this.to()!);
      }
      this.page.set(await this.bookingsService.getPage(query));
    } catch {
      this.error.set('No se pudieron cargar las reservas. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onStatusChange(value: BookingStatus | ''): void {
    this.status.set(value);
    this.resetAndLoad();
  }

  protected onFromChange(date: Date | null): void {
    this.from.set(date);
    this.resetAndLoad();
  }

  protected onToChange(date: Date | null): void {
    this.to.set(date);
    this.resetAndLoad();
  }

  protected onPageChange(index: number): void {
    this.page.update((current) => (current ? { ...current, number: index } : current));
    void this.load();
  }

  protected async cancelBooking(booking: BookingResponse): Promise<void> {
    const confirmed = await openConfirmDialog(this.dialog, {
      title: 'Cancelar reserva',
      message: `¿Seguro que quieres cancelar la reserva de "${booking.service.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Cancelar reserva',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.bookingsService.cancel(booking.id);
      this.snackBar.open('Reserva cancelada correctamente.', 'Cerrar', { duration: 3000 });
      void this.load();
    } catch {
      // El error se muestra mediante el toast global del interceptor.
    }
  }

  private resetAndLoad(): void {
    this.page.update((current) => (current ? { ...current, number: 0 } : current));
    void this.load();
  }
}
