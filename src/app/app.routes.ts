import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: '',
    data: { animation: 'catalog' },
    loadChildren: () => import('./features/services/services.routes').then((m) => m.servicesRoutes),
  },
  {
    path: 'login',
    data: { animation: 'login' },
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'register',
    data: { animation: 'register' },
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.registerRoutes),
  },
  {
    path: 'mis-reservas',
    data: { animation: 'bookings' },
    canActivate: [authGuard],
    loadChildren: () => import('./features/bookings/bookings.routes').then((m) => m.bookingsRoutes),
  },
  {
    path: 'admin',
    data: { animation: 'admin' },
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
