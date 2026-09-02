import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BookingTable } from '../../bookings/booking-table/booking-table';

@Component({
  selector: 'app-bookings-admin',
  imports: [BookingTable],
  templateUrl: './bookings-admin.html',
  styleUrl: './bookings-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsAdmin {}
