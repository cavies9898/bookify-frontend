import { HttpContext, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  forgotPassword(email: string, context?: HttpContext): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/forgot-password`, { email }, { context }),
    ).then(() => undefined);
  }

  resetPassword(token: string, newPassword: string, context?: HttpContext): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/reset-password`,
        { token, newPassword },
        { context },
      ),
    ).then(() => undefined);
  }
}
