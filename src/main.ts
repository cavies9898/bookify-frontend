import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(es);

bootstrapApplication(App, appConfig).catch(() => {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;text-align:center;padding:3rem">
      <h1>Error al iniciar la aplicación</h1>
      <p>Recarga la página o contacta al administrador.</p>
    </div>`;
});
