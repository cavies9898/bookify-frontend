import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' },

    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),

    provideZonelessChangeDetection(),

    provideNativeDateAdapter(),

    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
  ],
};
