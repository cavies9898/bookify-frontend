export interface ServiceResponse {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  capacity: number;
  price: number;
  openingTime: string;
  closingTime: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  capacity: number;
  price: number;
  openingTime: string;
  closingTime: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface TimeSlot {
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface AvailabilityResponse {
  serviceId: number;
  date: string;
  slots: TimeSlot[];
}
