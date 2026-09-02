import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

import { toApiRequestError } from '../../shared/utils/errors';

export const SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      const normalized = toApiRequestError(error);
      const shouldToast = !req.context.get(SUPPRESS_ERROR_TOAST) && normalized.status !== 401;
      if (shouldToast) {
        snackBar.open(normalized.message, 'Cerrar', { duration: 5000 });
      }
      return throwError(() => normalized);
    }),
  );
};
