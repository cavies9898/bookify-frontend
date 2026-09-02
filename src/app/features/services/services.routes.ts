import { Routes } from '@angular/router';

import { Catalog } from './catalog/catalog';
import { ServiceDetail } from './service-detail/service-detail';

export const servicesRoutes: Routes = [
  { path: '', component: Catalog },
  { path: 'services/:id', component: ServiceDetail },
];
