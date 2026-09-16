export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface BookingRequest {
  serviceId: number;
  startAt: string;
  endAt: string;
}

export interface BookingServiceSummary {
  id: number;
  name: string;
  price: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingResponse {
  id: number;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
  service: BookingServiceSummary;
  userName: string;
  userEmail: string;
}
