import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Page } from '../../shared/models/page';
import { AvailabilityResponse, ServiceRequest, ServiceResponse } from '../../shared/models/service';

export interface ServicePageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/services`;

  getPage(query: ServicePageQuery = {}): Promise<Page<ServiceResponse>> {
    let params = new HttpParams().set('page', query.page ?? 0).set('size', query.size ?? 20);
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return firstValueFrom(this.http.get<Page<ServiceResponse>>(this.baseUrl, { params }));
  }

  getById(id: number): Promise<ServiceResponse> {
    return firstValueFrom(this.http.get<ServiceResponse>(`${this.baseUrl}/${id}`));
  }

  getAvailability(id: number, date: string): Promise<AvailabilityResponse> {
    const params = new HttpParams().set('date', date);
    return firstValueFrom(
      this.http.get<AvailabilityResponse>(`${this.baseUrl}/${id}/availability`, { params }),
    );
  }

  create(payload: ServiceRequest, context?: HttpContext): Promise<ServiceResponse> {
    return firstValueFrom(this.http.post<ServiceResponse>(this.baseUrl, payload, { context }));
  }

  update(id: number, payload: ServiceRequest, context?: HttpContext): Promise<ServiceResponse> {
    return firstValueFrom(
      this.http.put<ServiceResponse>(`${this.baseUrl}/${id}`, payload, { context }),
    );
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
