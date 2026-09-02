import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../models/api-error';

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
  400: 'Solicitud inválida. Revisa los datos introducidos.',
  401: 'No autorizado. Revisa tus credenciales.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Conflicto con una reserva existente. Elige otro horario.',
  429: 'Demasiados intentos. Espera 1 minuto antes de volver a intentarlo.',
  500: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly apiError?: ApiError;

  constructor(status: number, message: string, apiError?: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.apiError = apiError;
  }
}

export function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiError> | undefined;
    if (body && typeof body.status === 'number' && typeof body.message === 'string') {
      return new ApiRequestError(body.status, body.message, body as ApiError);
    }
    return new ApiRequestError(error.status, fallbackMessage(error.status));
  }
  return new ApiRequestError(0, FALLBACK_MESSAGES[0]);
}

export function fallbackMessage(status: number): string {
  return FALLBACK_MESSAGES[status] ?? `Error inesperado (${status}). Inténtalo de nuevo.`;
}
