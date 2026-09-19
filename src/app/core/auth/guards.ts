import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Role } from '../../shared/models/auth';
import { SessionStore } from './session.store';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  if (session.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  if (session.isAuthenticated()) {
    return inject(Router).createUrlTree(['/']);
  }
  return true;
};

/**
 * Guard para rutas de administración.
 *
 * ⚠️ SEGURIDAD: Este guard solo protege la interfaz (UI-level).
 * Un atacante puede modificar sessionStorage para bypass (role: 'ADMIN').
 * El backend DEBE validar el role en el JWT de forma independiente.
 */
export const roleGuard =
  (role: Role): CanActivateFn =>
  () => {
    const session = inject(SessionStore);
    if (session.user()?.role === role) {
      return true;
    }
    return inject(Router).createUrlTree(['/']);
  };
