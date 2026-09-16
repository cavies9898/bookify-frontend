import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Page } from '../../../shared/models/page';
import { ServiceResponse } from '../../../shared/models/service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { formatTimeOfDay, minutesToLabel } from '../../../shared/utils/dates';
import { ServicesService } from '../services.service';

type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

@Component({
  selector: 'app-catalog',
  imports: [
    RouterLink,
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    EmptyState,
    Loading,
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog implements OnInit {
  private readonly servicesService = inject(ServicesService);

  protected readonly environment = environment;

  protected readonly page = signal<Page<ServiceResponse> | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly sort = signal<SortOption>('name,asc');
  protected readonly search = signal('');

  protected readonly formatted = { formatTimeOfDay, minutesToLabel };

  protected readonly filteredServices = computed(() => {
    const pageData = this.page();
    if (!pageData) {
      return [];
    }
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return pageData.content;
    }
    return pageData.content.filter((service) => service.name.toLowerCase().includes(query));
  });

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
        sort: this.sort(),
      });
      this.page.set(pageData);
    } catch {
      this.error.set('No se pudieron cargar los servicios. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onSortChange(value: string): void {
    this.sort.set(value as SortOption);
    void this.load();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected retry(): void {
    this.page.set(null);
    void this.load();
  }
}
