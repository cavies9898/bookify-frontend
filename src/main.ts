import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(es);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
