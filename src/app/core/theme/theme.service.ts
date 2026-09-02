import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'bookify-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(this.loadInitial());

  constructor() {
    this.apply(this.dark());
  }

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.apply(next);
  }

  private loadInitial(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
