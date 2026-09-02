import { Routes } from '@angular/router';

import { AdminLayout } from './admin-layout/admin-layout';
import { BookingsAdmin } from './bookings-admin/bookings-admin';
import { ServicesAdmin } from './services-admin/services-admin';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'servicios', pathMatch: 'full' },
      { path: 'servicios', component: ServicesAdmin },
      { path: 'reservas', component: BookingsAdmin },
    ],
  },
];
