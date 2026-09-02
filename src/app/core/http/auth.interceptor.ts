import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, from, mergeMap, Observable, throwError } from 'rxjs';

import { AuthResponse } from '../../shared/models/auth';
import { ApiRequestError } from '../../shared/utils/errors';
import { SessionStore } from '../auth/session.store';
import { TokenService } from '../auth/token.service';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
const PUBLIC_API_PATHS = ['/services'];

let refreshPromise: Promise<AuthResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const session = inject(SessionStore);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (PUBLIC_PATHS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const accessToken = tokenService.accessToken;

  if (!accessToken && PUBLIC_API_PATHS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const authedRequest = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authedRequest).pipe(
    catchError((error) => {
      if (isUnauthorized(error)) {
        return refreshAndRetry(authedRequest, next, { tokenService, session, router, snackBar });
      }
      throw error;
    }),
  );
};

function isUnauthorized(error: unknown): boolean {
  if (error instanceof HttpErrorResponse || error instanceof ApiRequestError) {
    return error.status === 401;
  }
  return false;
}

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  deps: {
    tokenService: TokenService;
    session: SessionStore;
    router: Router;
    snackBar: MatSnackBar;
  },
): Observable<HttpEvent<unknown>> {
  if (refreshPromise === null) {
    refreshPromise = deps.session.refresh().finally(() => {
      refreshPromise = null;
    });
  }

  return from(refreshPromise).pipe(
    catchError(() => {
      handleSessionExpired(deps);
      return throwError(() => new ApiRequestError(401, 'Sesión caducada. Inicia sesión de nuevo.'));
    }),
    mergeMap(() => {
      const newToken = deps.tokenService.accessToken;
      if (!newToken) {
        handleSessionExpired(deps);
        return throwError(
          () => new ApiRequestError(401, 'Sesión caducada. Inicia sesión de nuevo.'),
        );
      }
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
    }),
  );
}

function handleSessionExpired(deps: {
  session: SessionStore;
  router: Router;
  snackBar: MatSnackBar;
}): void {
  deps.session.logout();
  deps.snackBar.open('Tu sesión ha caducado. Inicia sesión de nuevo.', 'Cerrar', {
    duration: 5000,
  });
  void deps.router.navigate(['/login']);
}
