import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../../environments/environment';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { openConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Page } from '../../../shared/models/page';
import { ServiceResponse } from '../../../shared/models/service';
import { formatTimeOfDay, minutesToLabel } from '../../../shared/utils/dates';
import { ServicesService } from '../../services/services.service';
import { ServiceForm } from '../service-form/service-form';

@Component({
  selector: 'app-services-admin',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    EmptyState,
    Loading,
    Paginator,
  ],
  templateUrl: './services-admin.html',
  styleUrl: './services-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesAdmin implements OnInit {
  protected readonly environment = environment;
  private readonly servicesService = inject(ServicesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly page = signal<Page<ServiceResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly formatted = { formatTimeOfDay, minutesToLabel };

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const pageNumber = this.page()?.number ?? 0;
      const pageData = await this.servicesService.getPage({
        page: pageNumber,
        size: 20,
        sort: 'name,asc',
      });
      this.page.set(pageData);
    } catch {
      this.error.set('No se pudieron cargar los servicios. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onPageChange(index: number): void {
    this.page.update((current) => (current ? { ...current, number: index } : current));
    void this.load();
  }

  protected newService(): void {
    const ref = this.dialog.open(ServiceForm, {
      data: { service: null },
      width: '90vw',
      maxWidth: '900px',
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Servicio creado correctamente.', 'Cerrar', { duration: 3000 });
        void this.load();
      }
    });
  }

  protected editService(service: ServiceResponse): void {
    const ref = this.dialog.open(ServiceForm, {
      data: { service },
      width: '90vw',
      maxWidth: '900px',
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Servicio actualizado correctamente.', 'Cerrar', { duration: 3000 });
        void this.load();
      }
    });
  }

  protected async deleteService(service: ServiceResponse): Promise<void> {
    const confirmed = await openConfirmDialog(this.dialog, {
      title: 'Eliminar servicio',
      message: `¿Seguro que quieres dar de baja "${service.name}"? Ya no se podrá reservar.`,
      confirmLabel: 'Eliminar',
      isDestructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.servicesService.delete(service.id);
      this.snackBar.open('Servicio eliminado correctamente.', 'Cerrar', { duration: 3000 });
      void this.load();
    } catch {
      // El error se muestra mediante el toast global del interceptor.
    }
  }
}
