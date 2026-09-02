export interface ServiceResponse {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  capacity: number;
  price: number;
  openingTime: string;
  closingTime: string;
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
