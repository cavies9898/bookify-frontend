import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BookingRequest, BookingResponse, BookingStatus } from '../../shared/models/booking';
import { Page } from '../../shared/models/page';

export interface BookingPageQuery {
  status?: BookingStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  getPage(query: BookingPageQuery = {}): Promise<Page<BookingResponse>> {
    let params = new HttpParams().set('page', query.page ?? 0).set('size', query.size ?? 20);
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    return firstValueFrom(this.http.get<Page<BookingResponse>>(this.baseUrl, { params }));
  }

  create(payload: BookingRequest, context?: HttpContext): Promise<BookingResponse> {
    return firstValueFrom(this.http.post<BookingResponse>(this.baseUrl, payload, { context }));
  }

  cancel(id: number): Promise<BookingResponse> {
    return firstValueFrom(this.http.delete<BookingResponse>(`${this.baseUrl}/${id}`));
  }
}
