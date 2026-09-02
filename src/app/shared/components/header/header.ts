import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { SessionStore } from '../../../core/auth/session.store';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly session = inject(SessionStore);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly roleLabel = computed(() => {
    const role = this.session.user()?.role;
    if (role === 'ADMIN') {
      return 'Administrador';
    }
    if (role === 'CLIENTE') {
      return 'Cliente';
    }
    return '';
  });

  protected readonly avatarInitial = computed(() =>
    (this.session.user()?.name ?? '').trim().charAt(0).toUpperCase(),
  );

  logout(): void {
    this.session.logout();
    void this.router.navigate(['/login']);
  }
}
