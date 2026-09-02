import { HttpErrorResponse } from '@angular/common/http';

import { ApiRequestError, toApiRequestError } from './errors';

describe('toApiRequestError', () => {
  it('normaliza el ApiError del backend preservando el mensaje en español', () => {
    const httpError = new HttpErrorResponse({
      status: 409,
      error: {
        timestamp: '2030-06-10T10:00:00Z',
        status: 409,
        error: 'Conflict',
        message: 'El horario solicitado se solapa con una reserva existente',
        path: '/api/bookings',
      },
    });

    const result = toApiRequestError(httpError);

    expect(result).toBeInstanceOf(ApiRequestError);
    expect(result.status).toBe(409);
    expect(result.message).toBe('El horario solicitado se solapa con una reserva existente');
    expect(result.apiError?.path).toBe('/api/bookings');
  });

  it('usa un mensaje genérico por código de estado', () => {
    const httpError = new HttpErrorResponse({ status: 500, error: 'boom' });
    const result = toApiRequestError(httpError);
    expect(result.status).toBe(500);
    expect(result.message).toBe('Error interno del servidor. Inténtalo de nuevo más tarde.');
  });

  it('devuelve un mensaje de conexión para errores de red (status 0)', () => {
    const httpError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const result = toApiRequestError(httpError);
    expect(result.status).toBe(0);
    expect(result.message).toContain('No se pudo conectar');
  });

  it('devuelve el mismo error si ya es ApiRequestError', () => {
    const original = new ApiRequestError(400, 'Solicitud inválida.');
    expect(toApiRequestError(original)).toBe(original);
  });
});
