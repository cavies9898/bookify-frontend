import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BookingTable } from '../booking-table/booking-table';

@Component({
  selector: 'app-my-bookings',
  imports: [BookingTable],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookings {}
