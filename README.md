# Bookify · Frontend Angular

SPA en **Angular 22** (standalone, zoneless con signals) que consume el backend REST de reservas **Bookify** (Spring Boot). Sigue las mejores prácticas actuales de Angular: componentes *standalone*, `provideZonelessChangeDetection()`, *control flow* moderno (`@if` / `@for` / `@switch`), formularios reactivos tipados, *lazy loading* por feature y guardas funcionales.

## Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | Angular 22 |
| Lenguaje | TypeScript 6 |
| UI | Angular Material 22 + CDK |
| Mapas | Leaflet 1.9 |
| RxJS | 7.8 |
| State | Signals (`signal`, `computed`, `effect`) |
| Testing | Vitest 4 |
| Linting | ESLint 10 + angular-eslint |
| Formato | Prettier 3 |
| Build | Angular CLI 22 + esbuild |
| Package manager | npm 11 |

## Requisitos

- **Node.js ≥ 24.15** (el CLI de Angular 22 lo exige; con nvm: `nvm install 24`).
- Backend Bookify arrancado en `http://localhost:8080` (`./gradlew bootRun`).

## Puesta en marcha

```bash
npm install
npm start        # ng serve en http://localhost:5173
```

- El **puerto por defecto es `5173`** (configurado en `angular.json`), ya permitido por el CORS del backend.
- En desarrollo, las peticiones `/api/*` se redirigen a `http://localhost:8080` mediante `proxy.conf.json`, evitando CORS.

### Credenciales de prueba

| Rol     | Email               | Contraseña |
| ------- | ------------------- | ---------- |
| ADMIN   | `admin@bookify.com` | `admin123` |

## Scripts

| Comando               | Descripción                                          |
| --------------------- | ---------------------------------------------------- |
| `npm start`           | Servidor de desarrollo en `http://localhost:5173`    |
| `npm run build`       | Build de producción en `dist/bookify`                |
| `npm test`            | Tests unitarios con Vitest (en modo *watch*)         |
| `npm test -- --watch=false` | Ejecución única de tests                      |
| `npm run lint`        | ESLint (angular-eslint)                              |
| `npx prettier --write "src/**/*.{ts,html,css,scss}"` | Formateo |

## Arquitectura

```
src/app/
├── core/                    # Singleton: auth, interceptores, guards
│   ├── auth/                # token.service, auth.service, session.store, guards
│   └── http/                # auth.interceptor, error.interceptor
├── features/
│   ├── auth/                # login, register (lazy)
│   ├── services/            # catálogo, detalle + disponibilidad, services.service
│   ├── bookings/            # my-bookings + booking-table reutilizable
│   └── admin/               # admin-layout, CRUD servicios, todas las reservas
├── shared/
│   ├── models/              # contratos tipados de la API (Page<T>, ApiError, …)
│   ├── components/          # header, footer, confirm-dialog, paginator, badges…
│   └── utils/               # dates, validators, errors (normalización de errores)
└── app.config.ts            # proveedores globales
```

- **Lazy loading**: `loadChildren` por feature (`auth-routes`, `services-routes`, `bookings-routes`, `admin-routes`).
- **Estado**: `SessionStore` con signals (`user`, `isAuthenticated`, `isAdmin`, `isClient`) y acciones `login/register/refresh/logout`. Los componentes reaccionan con `computed()`.
- **Zoneless**: `provideZonelessChangeDetection()` + `ChangeDetectionStrategy.OnPush` en todos los componentes.

## Autenticación y sesión

- **TokenService**: `accessToken` y `user` en `sessionStorage` (token de corta vida ligado a la pestaña; al cerrarla se limpia y se reduce la ventana de exposición); `refreshToken` en `localStorage` (7 días, permite restaurar la sesión al recargar o reabrir el navegador).
- **Interceptores funcionales** (`provideHttpClient(withInterceptors(...), withFetch())`):
  - `authInterceptor`: añade `Authorization: Bearer <accessToken>` a todo salvo `/auth/login`, `/auth/register` y `/auth/refresh`. Ante un **401** lanza `POST /auth/refresh` (single-flight, sin bucles), guarda el nuevo par y **reintenta la petición una vez**. Si el refresh falla, cierra sesión y redirige a `/login`.
  - `errorInterceptor`: normaliza el `ApiError` del backend a un mensaje legible en español y lo muestra en un snackbar. Las peticiones con el flag `SUPPRESS_ERROR_TOAST` (formularios de login/registro/reserva) gestionan el error de forma inline.
- **Guards funcionales**: `authGuard` (sesión), `guestGuard` (login/registro), `roleGuard('ADMIN')` / `roleGuard('CLIENTE')`.
- **Restauración**: al recargar se restaura la sesión desde el almacenamiento; en pestañas nuevas (hay refresh token pero no access token) se hace un refresh silencioso. Si el access token caduca, el primer 401 dispara el refresh automático.

## UI

- **Angular Material 22 + CDK** (sistema de diseño oficial del ecosistema Angular, con soporte de primera clase para signals/zoneless y los componentes necesarios: datepicker, snackbar, dialog, form-field).
- Textos en **español**, fechas/horas en `es-ES` (`DatePipe`, `LOCALE_ID: 'es-ES'`) y precios en **EUR** (`CurrencyPipe`).
- Pantallas: catálogo paginado, detalle con selector de fecha y slots, login/registro, mis reservas (filtros por estado y rango de fechas, cancelación con confirmación) y panel de administración (CRUD de servicios y todas las reservas).
- Estados de carga (spinner), vacío y error en todas las pantallas; diseño responsive y ARIA.

## Entornos

- `src/environments/environment.ts` (dev): `apiUrl = 'http://localhost:8080/api'`.
- `src/environments/environment.prod.ts` (prod): se sustituye en el build vía `fileReplacements` en `angular.json`. Usa `window.BOOKIFY_API_URL` si existe o `/api` por defecto, de modo que la URL se puede inyectar en tiempo de despliegue.

## Testing

- **Vitest** (`@angular/build:unit-test`, `vitest.config.ts` con setup de locale `es`).
- 51 tests que cubren: `AuthService`, `TokenService`, `SessionStore`, `authInterceptor` (cabecera, endpoints públicos, refresh + reintento, refresh fallido), `errorInterceptor` (normalización, suppress), guards funcionales (con `provideRouter`), utilidades y *smoke tests* de los componentes clave.

## Notas

- `GET /api/services` solo devuelve servicios activos; la lista del panel de administración también corresponde a los activos (el backend no expone un filtro de inactivos).
- La búsqueda por nombre del catálogo filtra en cliente sobre la página actual; el orden (`sort`) sí se delega en la API.
- No hay logout server-side en este backend: al salir solo se limpia el estado en cliente.
