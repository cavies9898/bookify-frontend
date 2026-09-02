import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BookingStatus } from '../../models/booking';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'badge-pending' },
  CONFIRMED: { label: 'Confirmada', className: 'badge-confirmed' },
  CANCELLED: { label: 'Cancelada', className: 'badge-cancelled' },
};

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<BookingStatus>();

  protected readonly config = computed(() => STATUS_CONFIG[this.status()]);
}
